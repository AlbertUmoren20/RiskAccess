import React from 'react';
import { Link } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import "./login.css";
export function SignUp(){
    return(
    <>
    {/* <div className='wrapper signUp'>This is the SignUp page</div> */}
     <div className="form">
        <div className="heading">CREATE AN ACCOUNT</div>
        <form>
          <div>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div>
            <label htmlFor="name">E-Mail</label>
            <input type="text" id="email" placeholder="Enter your mail" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter you password"
            />
          </div>
          <button type="submit">Submit</button>
          <h2 align="center" class="or">
            OR
          </h2>
        </form>
        <p >
          Have an account ? <Link to="/login"> Login </Link>
        </p>
      </div>
</>
)
}
export default SignUp;