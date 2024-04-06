var bcrypt = require("bcrypt");
require("dotenv").config();
var jwt = require("jsonwebtoken");
var jwtUtil = require("../utils/jwt.util");
var emailSender = require("../utils/emailSender.util");
const {
  getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
  where,
} = require("firebase/firestore");
const { UserCollection, db } = require("../firestore/collection");
  
  const { getDoc,updateDoc } = require("firebase/firestore");

exports.register = async (req, res, next) => {
  try {
    const userData = req.body;

    const q = query(UserCollection, where("email", "==", userData.email));
    let querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return res
        .status(401)
        .json({ success: false, message: "Email already exists." });
    }
    let id = getStudentId(userData.email);
    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email." });
    }

    userData.activated = false;
    userData.studentId = id;
    userData.password = await bcrypt.hash(userData.password, 10);

    // Thêm người dùng vào cơ sở dữ liệu Firestore

    await addDoc(UserCollection, userData);
    let emailResult = await sendActivationMail(userData.email, id);
    if (emailResult) {
      return res.status(201).json({
        success: true,
        message: `Activation mail sent to ${userData.email}.`,
      });
    } else
      res.status(201).json({
        success: false,
        message: "Failed to send mail.",
      });
  } catch (error) {
    res.status(401);
  }
};
exports.login = async (req, res, next) => {
    const userData = req.body;
    // console.log(userData)
    const userQuery = query(UserCollection, where("email", "==", userData.email));
    const userSnapshot = await getDocs(userQuery);
  
    if (userSnapshot.empty) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }
    const userDoc = userSnapshot.docs[0].data();
    
    const isPasswordCorrect = await bcrypt.compare(userData.password, userDoc.password);
  
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }
  
    if (!userDoc.activated) {
      return res.status(401).json({ message: "Tài khoản chưa được kích hoạt." });
    }
    console.log( userSnapshot.docs[0].id);
    console.log(req.body.token)
    const updatedUserData = { ...userDoc, token: req.body.token  }; // Thêm trường token vào dữ liệu người dùng
    const userRef = userSnapshot.docs[0].ref;
    await updateDoc(userRef, updatedUserData); 
    const user = {...userDoc,id: userSnapshot.docs[0].id.toString(),"token": req.body.token}
    // Đăng nhập thành công
    res.status(201).json({ message: "Đăng nhập thành công.",user:user });
  };
  
async function sendActivationMail(gmail, username) {
  let token = jwtUtil.generateToken(username);
  const emailTemplate = ({ username, link }) => `
      <h2>B-Partner xin chào!</h2>
      <p>Nhấn vào liên kết sau để kích hoạt email.</p>
      <p>${link}</p>
      <p><i>Lưu ý: Liên kết chỉ có hiệu lực trong vòng 10 phút</i></p>
    `;
  const mailOptions = {
    from: "B-Partner",
    html: emailTemplate({
      username,
      link: `http://localhost:4000/auth/activate?token=${token}`,
    }),
    subject: "B-Partner - Kích hoạt tài khoản",
    to: gmail,
  };
  try {
    let res = await emailSender.sendMail(mailOptions);
    return { success: true, message: "Gửi mail kích hoạt thành công" };
  } catch (error) {
    return { success: false, message: "Gửi mail kích hoạt thất bại" };
  }
}

function getStudentId(email) {
  const regex = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+)@student\.tdtu\.edu\.vn$/;
  const match = regex.exec(email);

  if (match) {
    return match[1];
  } else {
    return null;
  }
}

exports.activate = async function (req, res) {
  const token = req.query.token;
  if (!token) return res.status(401).send("E1. Token không hợp lệ");
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    return res.status(401).send("E2. Token không hợp lệ");
  }
  if (
    !decoded.hasOwnProperty("username") ||
    !decoded.hasOwnProperty("expirationDate")
  ) {
    return res.status(401).send("E3. Token không hợp lệ");
  }
  let tokenStudentId = decoded.username;
  let expirationDate = Date.parse(decoded.expirationDate);
  if (expirationDate < new Date().getTime()) {
    return res.status(401).send("E4. Token đã hết hiệu lực.");
  }
  let querySnap = await getDocs(
    query(UserCollection, where("studentId", "==", tokenStudentId))
  );
  if (querySnap.empty) return res.status(401).send("E5. Token không hợp lệ.");
  let r = await updateDoc(querySnap.docs[0].ref, { activated: true });
  res.send("Kích hoạt tài khoản thành công!");
};

// exports.getLogin = async function (req, res) {
//   const token = req.query.token;
//   if (!token)
//     req.flash(
//       "error",
//       "Bạn chỉ có thể đăng nhập khi đã kích hoạt tài khoản. Nếu là người mới, vui lòng đăng nhập bằng liên kết từ email."
//     );
//   res.render("login", { title: "Login" });
// };

// exports.postLogin = async function (req, res) {
//   if (!req.form.isValid) {
//     return res.redirect("/auth/login");
//   }

//   const { username, password } = req.body;
//   if (username !== "admin") {
//     await loginAsStaff(req, res);
//   } else {
//     await loginAsAdmin(req, res);
//   }
// };
