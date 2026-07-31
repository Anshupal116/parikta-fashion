import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {

    const notifications = await Notification
        .find()
        .sort({createdAt:-1});

    res.json(notifications);

};

export const createNotification = async (req,res)=>{

    const notification = await Notification.create(req.body);

    res.json(notification);

};

export const markRead = async(req,res)=>{

    await Notification.findByIdAndUpdate(req.params.id,{
        read:true
    });

    res.json({success:true});

};

export const markAllRead = async(req,res)=>{

    await Notification.updateMany({},{
        read:true
    });

    res.json({success:true});

};

export const deleteNotification = async(req,res)=>{

    await Notification.findByIdAndDelete(req.params.id);

    res.json({success:true});

};