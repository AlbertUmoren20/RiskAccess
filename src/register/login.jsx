import React from 'react';
import { Link } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import "./login.css";

const preventRefresh = (e) => {
  alert("you cannot refresh");
  e.preventDefault();
};

export function Login() {
  const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
  const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

   const handleButtonClick = ()=> {
   setClicked(true);
   navigate('/admin');
 }


  const handleFormSubmit = (values) => {
    console.log(values);
  };
  const initialValues = { name: '', email: '' , password: ''};
  const checkoutSchema = yup.object().shape({
    name: yup.string().required('Name is required'),

    email: yup.string().email(emailRegExp, 'Invalid email').required('Email is required'),
    password: yup
        .string()
        .matches(
          passwordRegExp,
          "Password must be at least 8 characters" 
        )
        .required("Password is required"),
  });

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValues}
      validationSchema={checkoutSchema}
    >
      {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
        <>
          {/* <div className='wrapper signIn'>This is the Login page</div> */}
          <div className="form">
            <div className="heading">LOGIN</div>
            <form onSubmit={handleSubmit}>
              <div>

                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"  
                  // className='input_pass'
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.password && errors.password && (
                  <div className="error">{errors.password}</div>
                )}
              </div>
              <div>
                <label htmlFor="email">E-Mail</label>
                <input
                  type="email"
                  id="email"
                  // className='input_email'
                  name="email"
                  placeholder="Enter your mail"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <div className="error">{errors.email}</div>
                )}
              </div>
              <button type="submit">
                Submit
              </button>
            </form>
            <p>
              Don't have an account ? <Link to="/signup"> Sign In </Link>
            </p>
          </div>
        </>
      )}
    </Formik>
  );
}
