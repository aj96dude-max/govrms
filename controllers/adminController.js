const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

exports.getAdminFeed = async (req, res, next) => {
  try {
    const { departmentId, priority, status } = req.query;

    const matchStage = {};
    if (departmentId) matchStage.departmentId = new mongoose.Types.ObjectId(departmentId);
    if (priority) matchStage.priority = priority;
    if (status) matchStage.status = status;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      { $unwind: '$departmentInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'initiatorId',
          foreignField: '_id',
          as: 'initiatorInfo'
        }
      },
      { $unwind: '$initiatorInfo' },
      {
        $project: {
          ticketNumber: 1,
          category: 1,
          priority: 1,
          status: 1,
          'departmentInfo.deptCode': 1,
          'departmentInfo.deptName': 1,
          'departmentInfo.region': 1,
          'initiatorInfo.fullName': 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    const feed = await Ticket.aggregate(pipeline);

    res.status(200).json({ data: feed });
  } catch (error) {
    next(error);
  }
};
