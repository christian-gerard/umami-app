import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { object, string } from "yup";
import { Formik, Form, Field, useFormik } from "formik";

// // // // // Signup
const signupSchema = object({
  username: string()
    .min(3, "Username must be at least 3 characters long.")
    .max(20, "Username must be 20 characters or less.")
    .required("Username is required."),

  email: string(),

  password_hash: string()
    .min(8, "Password must be at least 8 characters long.")
    .require("Password is required"),

  confirmPassword: string()
    .oneOf([Yup.ref("password_hash"), null], "Passwords must match.")
    .required("Confirm Password is required."),
});

// // // // // Login
const loginSchema = object({
  username: string()
  .required("Username is required."),
  password_hash: string()
  .min(8, "Password must be at least 8 characters long.")
  .require("Password is required"),
});

// // // // // Initial Values
const initialValues = {
  username: "",
  email: "",
  password_hash: "",
  confirmPassword: "",
  role: 1,
};

function Auth() {
  const { login } = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const requestUrl = isLogin ? "/api/v1/login" : "/api/v1/signup";
  const formik = useFormik({
    initialValues,
    validationSchema: isLogin ? loginSchema : signupSchema,
    onSubmit: (formData) => {
      fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then((res) => {
        if (res.ok) {
          res
            .json()
            .then((userData) => {
              login(userData);
            })
            .then(() => {
              isLogin ? navigate("/cookbook") : navigate("/cookbook");
              toast.success("Logged in");
            });
        } else if (res.status === 422) {
          toast.error("Invalid Login");
        } else {
          return res.json().then((errorObj) => toast.error(errorObj.Error));
        }
      });
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen  ">
      <div className="bg-shittake p-6 text-white rounded-xl">
        <h1 className="text-6xl flex justify-center tracking-[0.25em] p-6">
          UMAMI
        </h1>
        <h2 className="text-3xl">{isLogin ? "Login" : "Sign Up"}</h2>
        <Formik onSubmit={formik.handleSubmit}>
          <Form
            className="flex justify-center flex-col p-1"
            onSubmit={formik.handleSubmit}
          >
            <Field
              type="text"
              name="username"
              placeholder="Username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="m-2 p-2 text-black rounded-lg"
              autoComplete="username"
            />
            {formik.errors.username && formik.touched.username && (
              <div className="">{formik.errors.username}</div>
            )}

            <Field
              type="password"
              name="password_hash"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password_hash}
              className="m-2 p-2 text-black rounded-lg"
              autoComplete="current-password"
            />
            {formik.errors.password_hash && formik.touched.password_hash && (
              <div className="error-message show">
                {formik.errors.password_hash}
              </div>
            )}
            {!isLogin && (
              <>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className="m-2 p-2 text-black rounded-lg"
                />
                {formik.errors.confirmPassword &&
                  formik.touched.confirmPassword && (
                    <div className="error-message show">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="m-2 p-2 text-black rounded-lg"
                />
                {formik.errors.email && formik.touched.email && (
                  <div className="error-message show">
                    {formik.errors.email}
                  </div>
                )}
              </>
            )}
            <input
              type="submit"
              className="bg-champagne text-black text-lg p-1 m-1 rounded-lg"
              value={isLogin ? "Login" : "Sign up"}
            />

            <button
              type="button"
              className="text-lg text-blue-200"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create New Account" : "Login to Account"}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default Auth;