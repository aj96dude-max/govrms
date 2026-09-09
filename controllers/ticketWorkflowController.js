const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const AuditLedger = require('../models/AuditLedger');

exports.createTicket = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { category, subCategory, priority, details } = req.body;
    
    // Auto-generate ticket number if not provided by client
    const ticketNumber = req.body.ticketNumber || `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create Ticket
    const ticket = new Ticket({
      ticketNumber,
      initiatorId: req.user.userId,
      departmentId: req.user.departmentId,
      category,
      subCategory,
      priority,
      details,
      status: 'SUBMITTED',
      attachments: req.body?.attachments || []
    });
    const savedTicket = await ticket.save({ session });

    // Create AuditLedger entry
    const ledger = new AuditLedger({
      ticketId: savedTicket._id,
      action: 'SUBMISSION',
      actorId: req.user.userId,
      previousState: 'NONE',
      newState: 'SUBMITTED',
      metadata: { ip: req.ip }
    });
    await ledger.save({ session });

    await session.commitTransaction();
    res.status(201).json(savedTicket);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.endorseTicket = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId).session(session);

    if (!ticket) {
      throw { status: 404, message: 'Ticket not found' };
    }

    if (ticket.status !== 'SUBMITTED') {
      throw { status: 400, message: 'Ticket must be in SUBMITTED state to be endorsed' };
    }

    const previousState = ticket.status;
    ticket.status = 'LINE_MANAGER_APPROVED';
    await ticket.save({ session });

    const latestLedger = await AuditLedger.findOne({ ticketId }).sort({ timestamp: -1 }).session(session);
    const previousHash = latestLedger ? latestLedger.currentHash : 'GENESIS';

    const ledger = new AuditLedger({
      ticketId: ticket._id,
      action: 'ENDORSEMENT',
      actorId: req.user.userId,
      previousState: previousState,
      newState: 'LINE_MANAGER_APPROVED',
      previousHash: previousHash,
      metadata: { note: req.body?.note || '' }
    });
    await ledger.save({ session });

    await session.commitTransaction();
    res.status(200).json(ticket);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.clearTicket = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId).session(session);

    if (!ticket) {
      throw { status: 404, message: 'Ticket not found' };
    }

    const previousState = ticket.status;
    ticket.status = 'RESOLVED';
    await ticket.save({ session });

    const latestLedger = await AuditLedger.findOne({ ticketId }).sort({ timestamp: -1 }).session(session);
    const previousHash = latestLedger ? latestLedger.currentHash : 'GENESIS';

    const ledger = new AuditLedger({
      ticketId: ticket._id,
      action: 'FULFILLMENT',
      actorId: req.user.userId,
      previousState: previousState,
      newState: 'RESOLVED',
      previousHash: previousHash
    });
    await ledger.save({ session });

    await session.commitTransaction();
    res.status(200).json(ticket);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
