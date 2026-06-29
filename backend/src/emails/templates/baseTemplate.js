import emailBrand from "../emailBrand.js";

const baseTemplate = ({
    title,
    heading,
    body,
    buttonText = null,
    buttonUrl = null
}) => {

    return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>${title}</title>

</head>

<body
style="
margin:0;
padding:0;
background:${emailBrand.colors.light};
font-family:Arial, Helvetica, sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
background:${emailBrand.colors.light};
padding:40px 0;
">

<tr>

<td align="center">

<table
width="650"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 8px 25px rgba(0,0,0,.08);
">

<!-- Header -->

<tr>

<td
style="
background:${emailBrand.colors.dark};
padding:30px;
text-align:center;
">

<h1
style="
margin:0;
font-size:34px;
font-weight:bold;
">

<span style="color:${emailBrand.colors.primary};">
SOLE
</span>

<span style="color:white;">
STREET
</span>

</h1>

<p
style="
color:#cccccc;
margin-top:8px;
font-size:14px;
">

Premium Sneakers • Authentic Brands

</p>

</td>

</tr>

<!-- Content -->

<tr>

<td
style="
padding:50px 45px;
">

<h2
style="
margin-top:0;
color:${emailBrand.colors.dark};
">

${heading}

</h2>

<div
style="
font-size:16px;
line-height:1.8;
color:#555;
">

${body}

</div>

${
buttonText
?
`
<div
style="
text-align:center;
margin-top:40px;
">

<a
href="${buttonUrl}"

style="
background:${emailBrand.colors.primary};
color:white;
padding:16px 34px;
border-radius:40px;
text-decoration:none;
font-weight:bold;
display:inline-block;
">

${buttonText}

</a>

</div>
`
:
""
}

</td>

</tr>

<!-- Divider -->

<tr>

<td>

<hr
style="
border:none;
border-top:1px solid #eeeeee;
">

</td>

</tr>

<!-- Footer -->

<tr>

<td
style="
padding:35px;
background:#fafafa;
text-align:center;
">

<p
style="
margin:0;
font-size:14px;
color:#777;
">

Need help?

</p>

<p
style="
margin:8px 0;
">

<a
href="mailto:${emailBrand.supportEmail}"
style="
color:${emailBrand.colors.primary};
text-decoration:none;
">

${emailBrand.supportEmail}

</a>

</p>

<div style="margin:20px 0;">

<a
href="${emailBrand.website}"
style="
margin:0 10px;
color:${emailBrand.colors.primary};
text-decoration:none;
">

Website

</a>

<a
href="${emailBrand.instagram}"
style="
margin:0 10px;
color:${emailBrand.colors.primary};
text-decoration:none;
">

Instagram

</a>

<a
href="${emailBrand.facebook}"
style="
margin:0 10px;
color:${emailBrand.colors.primary};
text-decoration:none;
">

Facebook

</a>

</div>

<p
style="
margin-top:25px;
font-size:12px;
color:#999;
">

© ${new Date().getFullYear()}
${emailBrand.company}

All rights reserved.

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;

};

export default baseTemplate;