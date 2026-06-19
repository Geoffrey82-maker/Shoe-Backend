import EventLog from "../models/EventLog.js";

const logEvent = async({
    user,
    action,
    entity,
    entityId,
    metadata
}) => {
    try {
        await EventLog.create({
            user,
            action,
            entity,
            entityId,
            metadata
        })
    }catch(error) {
        console.error("Event Log Error", error.message);
    }
};

export default logEvent;