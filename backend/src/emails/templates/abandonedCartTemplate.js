import baseTemplate from "./baseTemplate.js";

export default ({
    firstname,
    cart,
    cartUrl
}) =>

baseTemplate({

    title: "You left something behind",

    heading: `Hi ${firstname}!`,

    body: `

        <p> Your shopping cart is waiting for you.</p>

        <p>Complete your purchase before your favorite sneakers sell out.</p>

        <p>You currently have<strong>${cart.items.length}</strong>items waiting.</p>

    `,

        buttonText:"Return To Cart",

        buttonUrl:cartUrl

});