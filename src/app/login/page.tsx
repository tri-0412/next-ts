"use client";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import "../globals.css";
import { RiErrorWarningLine } from "react-icons/ri";
import {
  createTemporaryAccount,
  loginWithEmailAndPassword,
  loginWithGoogle,
  resendVerificationEmail,
} from "../../../firebase/firebase";
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false); // Đảm bảo đồng bộ hóa CSR
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false); // Trạng thái hiển thị mật khẩu
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Chỉ render nội dung sau khi client tải xong
  }, []);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa khi load trang
    const token = localStorage.getItem("userToken");
    if (token) {
      router.push("/home"); // Đưa người dùng về trang home nếu đã đăng nhập
    }
  }, [router]);

  if (!isClient) return null; // Tránh render trên server
  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    router.push(isLogin ? "/signup" : "/login");
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev); // Thay đổi trạng thái hiển thị mật khẩu
  };
  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };
  const isEmailValid =
    email && /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Đánh dấu các input đã bị "touched" để hiển thị lỗi
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isEmailValid || password.length < 6) {
      return; // Dừng nếu có lỗi
    }
    try {
      if (isLogin) {
        //Đăng Nhập
        const user = await loginWithEmailAndPassword(email, password);
        if (user) {
          const token = await user.getIdToken();
          localStorage.setItem("userToken", token); // Lưu token vào localStorage
          console.log("Logged in user: ", user);
          router.push("/home");
        }
      } else {
        // Đăng ký
        const user = await createTemporaryAccount(email);
        // Lưu token vào localStorage nếu đăng ký thành công
        if (user) {
          const token = await user.getIdToken();
          localStorage.setItem("userToken", token); // Lưu token vào localStorage
          console.log("Signed up user:", user);
          router.push("/home");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error:", error.message);

        if (
          error.message.includes("Vui lòng xác minh email trước khi đăng nhập")
        ) {
          const resend = window.confirm(
            "Email chưa được xác minh. Bạn có muốn gửi lại email xác minh không?"
          );
          if (resend) {
            try {
              await resendVerificationEmail();
              alert(
                "Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
              );
            } catch (resendError) {
              console.log("Error resending verification email:", resendError);
              alert("Không thể gửi lại email xác minh. Vui lòng thử lại sau.");
            }
          }
        } else {
          alert("Authentication failed: " + error.message);
        }
      } else {
        console.log("Unknown error:", error);
        alert("An unknown error occurred.");
      }
    }

    // Xử lý đăng nhập (nếu không có lỗi)
    console.log("Logging in with:", { email, password });
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (!user) {
        console.error("No user returned from Google sign-in.");
        return;
      }
      const token = await user.getIdToken();
      localStorage.setItem("userToken", token);
      console.log("Logged in with Google:", user);
      console.log("Token:", token);
      router.push("/home");
      router.push("/home");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Google sign-in error:", error.message);
        alert("Google Sign-In failed: " + error.message);
      } else {
        console.error("Unknown error:", error);
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 via-purple-100 to-purple-200">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4">
        <div className="text-2xl font-bold">Gradient</div>
        <div className="relative rounded-full bg-[#F4F4F3] text-[#E0E0E0] h-8 flex text-xs font-medium">
          <div className="absolute left-0 top-0 h-full rounded-full bg-[#3C404F] transition-left duration-500"></div>
          <button
            className={`px-4 py-2 rounded-full  flex items-center justify-center transition-all duration-500 ${
              isLogin ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
            }`}
            onClick={() => router.push("/login")}
          >
            Log In
          </button>
          <button
            className={`px-4 py-2 rounded-full flex items-center justify-center transition-all duration-500 ${
              !isLogin ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
            }`}
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="w-full md:max-w-md max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-medium text-center">
          {isLogin ? "Log In" : "Sign Up"}
        </h2>
        <p className="text-center text-sm text-[#B2B2B2] mt-2">
          {isLogin
            ? "Welcome back! Log in to stay updated with all your nodes and rewards."
            : "Start your journey on Gradient Network and shape the future of compute."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Email */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-800 ">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              type="email"
              placeholder="Enter Email"
              className="mt-1 block w-full px-5 py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none text-sm"
            />

            <div className="h-6 overflow-hidden">
              {emailTouched && !isEmailValid && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <RiErrorWarningLine />
                  Please enter a valid email address.
                </p>
              )}
            </div>
          </div>
          {/* Password */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-8800">
              Password
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                type={isPasswordVisible ? " text" : "password"}
                placeholder="Enter Password"
                className=" mt-1 block w-full px-5 text-sm py-2 border border-gray-200 rounded-full shadow-sm hover:border-[#1677ff] focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] focus:outline-none"
              />

              <span
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
              >
                {isPasswordVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </span>
            </div>
            <div className="h-6 overflow-hidden">
              {passwordTouched && password.length < 6 && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <RiErrorWarningLine />
                  Please enter a valid password.
                </p>
              )}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="  text-right text-xs text-gray-500 underline ">
            <a href="/forgotpassword">Forgot Password</a>
          </div>

          {/* Buttons */}
          {/* Nút */}
          <button
            type="submit"
            className="relative w-full flex items-center bg-black justify-center text-white py-2.5 px-4 rounded-full hover:bg-gradient-to-r hover:from-gray-900 hover:via-gray-500 hover:to-gray-900 custom-flying-button"
          >
            {isLogin ? "Log In" : "Confirm"}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* Hạt di chuyển bên trong nút */}
              {[...Array(30)].map((_, index) => (
                <div
                  key={index}
                  className="particle"
                  style={{
                    top: `${Math.random() * 100}%`, // Vị trí ngẫu nhiên dọc theo chiều cao
                    left: `${Math.random() * 100}%`, // Vị trí ngẫu nhiên ngang
                    animationDelay: `${Math.random() * 1}s`, // Thời gian trễ ngẫu nhiên cho từng hạt
                  }}
                ></div>
              ))}
            </div>
            <canvas className="w-full h-full absolute inset-0 pointer-events-none"></canvas>
          </button>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full border border-gray-300 text-black py-2.5 px-4 rounded-full flex items-center justify-center space-x-2 group-hover hover:text-[#1677ff] hover:border-[#1677ff] "
          >
            <FcGoogle />
            <span>Sign in with Google</span>
          </button>
        </form>

        {/* Switch between Log In and Sign Up */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={toggleAuthMode}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
