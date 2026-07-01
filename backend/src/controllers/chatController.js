import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

export const createChatRoom = async (req,res) => {

    try {
        let room = await ChatRoom.findOne({
            customer: req.user._id,
            status: {
                $in: [
                    "waiting",
                    "active"

                ]
            }
        });

        if (room) {
            return res.json({
                success: true,
                room
            });
        }

        room = await ChatRoom.create({
            customer: req.user._id
        });

        res.status(201).json({
            success: true,
            room
        });
    }

    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

export const getMessages = async (req,res) => {

    try{
        const messages = await Message.find({
            room:req.params.roomId
        })
        .populate(
            "sender",
            "firstname lastname role"
        )
        .sort({
            createdAt:1
        });
        res.json({
            success:true,
            messages
        });
    }

    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

export const getWaitingChats = async (req,res) => {

    try{
        const rooms = await ChatRoom.find({
            status:"waiting"
        })
        .populate(
            "customer",
            "firstname lastname email"
        )
        .sort({
            createdAt:1
        });

        res.json({
            success:true,
            rooms
        });
    }

    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }

};

export const acceptChat = async (req,res) => {
    try{
        const room = await ChatRoom.findById(
            req.params.id
        );

        if(!room){
            return res.status(404).json({
                success:false,
                message:"Room not found"
            });
        }

        room.admin=req.user._id;

        room.status="active";

        await room.save();

        res.json({
            success:true,
            room
        });
    }

    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

export const closeChat = async (req,res)=> {
    try{
        const room = await ChatRoom.findById(
            req.params.id
        );

        if(!room){
            return res.status(404).json({
                success:false
            });
        }

        room.status="closed";

        await room.save();

        res.json({
            success:true
        });

    }

    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};