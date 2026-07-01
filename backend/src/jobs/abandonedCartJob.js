import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { sendAbandonedCartEmail } from "../services/emailService.js";

export const abandonedCartJob = async ()=>{

    const oneHourAgo= new Date( Date.now()-60*60*1000);

    const carts = await Cart.find({ 
        updatedAt:{ $lte:oneHourAgo },

        "items.0":{
            $exists:true
        },

        recovered:false
    }).populate("user");

    for(const cart of carts){

        const user = await User.findById(cart.user);

        if(!user)continue;

        await sendAbandonedCartEmail(
            user,
            cart
        );

        cart.lastReminderSent = new Date();
        
        await cart.save();

    }

};