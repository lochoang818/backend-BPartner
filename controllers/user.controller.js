const {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
} = require("firebase/firestore");
const { UserCollection } = require("../firestore/collection");
const userService = require("../service/user.service");
require("express-async-errors"); // Import thư viện express-async-errors

const createUser = async (req, res, next) => {
    try {
        const userData = req.body;

        // Thêm người dùng vào cơ sở dữ liệu Firestore
        let doc = await addDoc(UserCollection, userData);
        res.status(201).json({ msg: "User Added" });
    } catch (error) {
        throw new Error("Bad request");
    }
};
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
};
const getUserById = async (req, res, next) => {
    const id = req.params.id;
    const user = await userService.handleGetUserById(id);
    if (user) {
        res.status(200).json({ user });
    } else {
        res.status(400).json({ message: "Failed to fetch user by id" });
    }
};

const updateUserInfo = async (req, res, next) => {
    const id = req.params.id;
    let newData = {
        name: req.body.name,
        address: req.body.address,
        grade: req.body.grade,
        gender: req.body.gender,
        faculty: req.body.faculty,
        avatar: req.file.path,
    };

    let r = await userService.updateUserInfoById(id, newData);
    console.log(r);
    // const user = await userService.handleGetUserById(id);
    // if (user) {
    //     res.status(200).json({ user });
    // } else {
    //     res.status(400).json({ message: "Failed to fetch user by id" });
    // }
};

module.exports = {
    createUser,
    getUser,
    getUserById,
    updateUserInfo,
};
