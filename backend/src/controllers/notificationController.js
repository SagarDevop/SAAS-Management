const Notification = require('../models/Notification');

// @desc    Get all notifications with filtering & pagination
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { type, readStatus } = req.query;

    const filter = { businessId };
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (readStatus !== undefined && readStatus !== 'all') {
      filter.readStatus = readStatus === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('workerId', 'name workerId')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      businessId,
      readStatus: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.businessId },
      { readStatus: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification status' });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { businessId: req.businessId, readStatus: false },
      { readStatus: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
};

