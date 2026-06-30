import baseTemplate from "./baseTemplate.js";

const newsletterTemplate = ({

    title,

    body,

    buttonText,

    buttonUrl

}) => {

    return baseTemplate({

        title,

        heading: title,

        body,

        buttonText,

        buttonUrl

    });

};

export default newsletterTemplate;