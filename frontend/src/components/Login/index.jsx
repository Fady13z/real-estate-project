import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import api from "./../../api/axiosConfig";

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: res } = await api.post("/users/login", data);

            // حفظ التوكن وتحديث الهيدر
            localStorage.setItem("token", res.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;

            // التوجيه حسب الدور
            if (res.user.role === "employee") {
                navigate("/employeeDash");
            } else if (res.user.role === "moderator") {
                navigate("/moderatorDash");
            } else {
                navigate("/");
            }
        } catch (error) {
            if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                setError(error.response.data.message || "فشل تسجيل الدخول");
            } else {
                setError("خطأ في الشبكة. يرجى المحاولة مرة أخرى.");
            }
        }
    };

    return (
        <div className={styles.login_container}>
            <div className={styles.login_form_container}>
                <h1 className={styles.login_title}>سجل الدخول الآن</h1>
                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>البريد الإلكتروني</label>
                    <input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        name="email"
                        onChange={handleChange}
                        value={data.email}
                        required
                        className={styles.input}
                        dir="rtl"
                    />
                    <label className={styles.label}>كلمة المرور</label>
                    <input
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        name="password"
                        onChange={handleChange}
                        value={data.password}
                        required
                        className={styles.input}
                        dir="rtl"
                    />
                    {error && <div className={styles.error_msg}>{error}</div>}
                    <button type="submit" className={styles.login_btn}>تسجيل الدخول</button>
                </form>
                <p className={styles.signup_link}>
                    ليس لديك حساب؟ <Link to="/signup" className={styles.link}>سجل الآن</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
