import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from "@mui/material";

function NewCustomerPage() {

     const handleFormSubmit = (values) => {
    console.log(values);
  };

    return (
         <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >  {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>

               { <Box className="page">
                    <h1 className="title">New Team </h1>
                    <p className="description">Add New Team Members </p>
         </Box> }

            <Box
              display="grid"
              gap="30px" >
        
      
         <TextField 
               className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
              className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
              className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                 className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                variant="filled"
                type="text"
                label="Contact Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                 className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                variant="filled"
                type="text"
                label="Address 1"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address1}
                name="address1"
                error={!!touched.address1 && !!errors.address1}
                helperText={touched.address1 && errors.address1}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                 className="form-field dark:[&_.MuiInputLabel-root]:text-slate-300 dark:[&_.MuiInputBase-input]:text-white"
                variant="filled"
                type="text"
                label="Address 2"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address2}
                name="address2"
                error={!!touched.address2 && !!errors.address2}
                helperText={touched.address2 && errors.address2}
                sx={{ gridColumn: "span 4"}}
              />

              <FormControl
                  fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
                error={!!touched.access && !!errors.access}
            >
            <InputLabel id="access-label">Access Level</InputLabel>
              <Select
              className="form-field dark:[&_.MuiSelect-icon]:text-white"
              labelId="access-label"
              id="access"
              name="access"
              value={values.access}
              label="Access Level"
              onBlur={handleBlur}
              onChange={handleChange}
              sx={{ gridColumn: "span 4" }}
  >
    <MenuItem value="admin">Admin</MenuItem>
    <MenuItem value="manager">Manager</MenuItem>
    <MenuItem value="user">User</MenuItem>
    {/* <MenuItem value="access Level">Access Level</MenuItem> */}
  </Select>
     {touched.access && errors.access && (
    <FormHelperText error>{errors.access}</FormHelperText>
  )}
</FormControl>
            </Box>
              <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    );
}
const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
  access: yup.string()
    .oneOf(['admin', 'manager', 'user'], 'Invalid access level')
    .required('Access level is required'),
  password: yup
    .string()
    .matches(
      passwordRegExp,
      "Password must be at least 8 characters, include at least one letter and one number"
    )
    .required("Password is required"),
});
const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  address1: "",
  address2: "",
  access: "user"
};

export default NewCustomerPage;