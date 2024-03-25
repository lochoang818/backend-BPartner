const { getFirestore, collection, addDoc,getDocs } = require("firebase/firestore/lite");
const {UserCollection} = require('../Collection/collection');
require('express-async-errors'); // Import thư viện express-async-errors


const createUser =async (req, res, next)=>{
 
    try {

        const userData = req.body;
        console.log("User Data:", userData);
        
        // Thêm người dùng vào cơ sở dữ liệu Firestore
        await addDoc(UserCollection, userData);        
        res.status(201).json({ msg: "User Added" });
    } catch (error) {
  
        throw new Error("Bad request")
    }
}
const getUser = async (req, res, next) => {
    try {
        // Lấy tất cả tài liệu từ bộ sưu tập người dùng
        const querySnapshot = await getDocs(UserCollection);

        // Tạo một mảng để lưu trữ tất cả người dùng
        const users = [];

        querySnapshot.forEach((doc) => {
            // Lấy id của từng tài liệu và kết hợp nó với dữ liệu của người dùng
            const userData = { id: doc.id, ...doc.data() };
            users.push(userData);
        });

        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}
module.exports = {
    createUser,
    getUser
}