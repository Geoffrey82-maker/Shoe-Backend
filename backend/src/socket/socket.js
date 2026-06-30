import { Server } from "socket.io";
import Message from "../models/Message.js";

let io;

const onlineUsers = new Map();

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User Connected:", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId);

            onlineUsers.set(
                userId,
                socket.id
            );

            io.emit(
                "online-users",
                [...onlineUsers.keys()]
            );
        });

        socket.on(
            "join-chat",

            roomId => {
                socket.join(roomId);
            }
        );
        
        socket.on("send-message", async(data)=>{

                try{
                    const message = await Message.create({
                        room:data.room,
                        sender:data.sender,
                        message:data.message
                    });

                    const populated = await Message.findById(message._id).populate(
                        "sender",
                        "firstname lastname role"
                    );

                    io.to(data.room)

                    .emit(
                        "receive-message",
                        populated
                    );
                }

                catch(error){
                    console.error(error);
                }
            }
        );

        socket.on("typing", roomId => {
                socket.to(roomId)
                .emit(
                    "user-typing"
                );
            }
        );

        socket.on("stop-typing", roomId=>{

                socket.to(roomId)
                .emit(
                    "user-stop-typing"
                );
            }
        );

        socket.on("message-read", async(messageId)=>{
                await Message.findByIdAndUpdate(
                    messageId,
                    {
                        read:true
                    }
                );

                io.emit(
                    "message-read",
                    messageId
                );
            }
        );

        socket.on("disconnect", ()=>{

                for(const [userId,id]
                    of onlineUsers){

                        if(id===socket.id){

                            onlineUsers.delete(userId);
                            break;

                        }
                }

                io.emit(

                    "online-users",

                    [...onlineUsers.keys()]

                );

            }

        );
    });

};

export const getIO = () => io;