import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Signup = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: "employee"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = "https://confident-serenity.up.railway.app/api/users/register";
            const { data: res } = await axios.post(url, data);
            navigate("/");
            console.log(res);
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                setError(error.response.data.message);
            }
        }
    };

    return (
        <div className={styles.signup_container}>
            <form className={styles.signup_form} onSubmit={handleSubmit}>
                <h1 className={styles.form_title}>أنشئ حسابك الآن</h1>

                <div className={styles.input_wrapper}>
                    <input
                        type="text"
                        placeholder="الاسم الكامل"
                        name="name"
                        onChange={handleChange}
                        value={data.name}
                        required
                        className={styles.input}
                        dir="rtl"
                    />
                </div>

                <div className={styles.input_wrapper}>
                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        name="email"
                        onChange={handleChange}
                        value={data.email}
                        required
                        className={styles.input}
                        dir="rtl"
                    />
                </div>

                <div className={styles.radio_container}>
                    <label className={styles.radio_label}>
                        <input
                            type="radio"
                            name="role"
                            value="moderator"
                            checked={data.role === "moderator"}
                            onChange={handleChange}
                            className={styles.radio_input}
                        />
                        <span>مشرف</span>
                    </label>
                    <label className={styles.radio_label}>
                        <input
                            type="radio"
                            name="role"
                            value="employee"
                            checked={data.role === "employee"}
                            onChange={handleChange}
                            className={styles.radio_input}
                        />
                        <span>موظف</span>
                    </label>
                </div>

                <div className={styles.input_wrapper}>
                    <input
                        type="password"
                        placeholder="كلمة المرور"
                        name="password"
                        onChange={handleChange}
                        value={data.password}
                        required
                        className={styles.input}
                        dir="rtl"
                    />
                </div>

                {error && <div className={styles.error_msg}>{error}</div>}

                <button type="submit" className={styles.signup_btn}>
                    تسجيل حساب جديد
                </button>

                <p className={styles.login_link}>
                    لديك حساب بالفعل؟{" "}
                    <Link to="/" className={styles.link}>
                        سجل الدخول
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
