export const getVerifyMailTemplate = (url: string, text?: string): string => {
  return ` <div
    style="
      text-align: center;
      border-radius: 5px;
      padding: 10px;
      border: 1px solid blue;
      height: 600px;
      width: 600px;
      background-color: white;
      margin: 0 auto;
    "
  >
    <h1
      style="
        text-align: center;
        color: blue;
        font-weight: 600;
        font-family: Arial, Helvetica, sans-serif;
      "
    >
      Thanks For Choosing Us,, Click Below Link To Verify Your Account.
    </h1>
    <a
      style="margin-top: 50px; text-align: center"
      href="${url}"
      ><button
        style="
          outline: none;
          border: none;
          font-weight: bolder;
          cursor: pointer;
          color: white;
          background-color: blue;
          padding: 10px 20px;
          margin-top: 40px;
        "
      >
        Verify
      </button></a
    >
    <p style="margin-top: 20px">${text}</p>
  </div>`;
};

export const getPasswordResetCodeTemplate = (
  code: number,
  text?: string
): string => {
  return ` <div
  style="
    text-align: center;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid blue;
    height: 600px;
    width: 600px;
    background-color: white;
    margin: 0 auto;
  "
>
  <h1
    style="
      text-align: center;
      color: blue;
      font-weight: 600;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    Use Below Code for reset your password
  </h1>
  <button
    style="
      outline: none;
      border: none;
      font-weight: bolder;
      cursor: pointer;
      color: white;
      background-color: blue;
      padding: 10px 20px;
      margin-top: 40px;
      font-size: 30px;
    "
  >
    ${code}
  </button>
  <p style="margin-top: 20px">${text}</p>
</div>`;
};
