import Activity from "../models/Activity.js";

export const logActivity = async ({

    action,

    description,

    performedBy = null,

    module = "system",

    metadata = {}

}) => {

    return await Activity.create({

        action,

        description,

        performedBy,

        module,

        metadata

    });

};