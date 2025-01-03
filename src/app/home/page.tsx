"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();
  useEffect(() => {
    // Kiểm tra token khi trang được load
    const token = localStorage.getItem("userToken");
    if (!token) {
      // Nếu không có token, chuyển hướng về trang đăng nhập
      router.push("/login");
    }
  }, [router]);
  // Hàm xử lý khi click vào nút Log Out
  const handleLogout = () => {
    // Xóa token lưu trong localStorage
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userToken"); // Xóa tất cả thông tin trong sessionStorage

    // Điều hướng người dùng về trang đăng nhập
    router.push("/login");
  };
  return (
    <div className="flex flex-col items-center min-h-screen  h-full bg-gradient-to-r from-blue-500 to-purple-500">
      {/* Nút Log Out */}
      <div className="w-full h-full flex justify-end items-center">
        <button
          onClick={handleLogout}
          className="mt-4 mr-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
        >
          Log Out
        </button>
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">
        Welcome to your HomePage!
      </h1>

      <p className="text-lg text-gray-200 mb-8">This is a protected page.</p>
      <button className="px-4 py-2 bg-white text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300">
        Learn More
      </button>
      <div className="mt-10 p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-500">
          Featured Content
        </h2>
        <p className="text-gray-700">
          Here you can find some interesting articles and resources.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
