import baseTemplate from "./baseTemplate.js";

export default ({ firstname, product }) =>

baseTemplate({

    title: "Back In Stock",

    heading: `Hi ${firstname}!`,

    body: `

    <p>Good news!</p>

    <p><strong>${product.name}</strong>is back in stock.</p>

    <p>Don't wait too long.Popular sizes sell out quickly.</p>

`,

    buttonText: "Shop Now",

    buttonUrl: `${process.env.FRONTEND_URL}/products/${product.slug}`

});