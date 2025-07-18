import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import CustomersPage from "@/routes/dashboard/customers/page";
import NewCustomerPage from "@/routes/dashboard/customers/newcustomers/page";
import Standards from "./routes/dashboard/products";
import NewStandards from "./routes/dashboard/newproducts";
import Calendar from "./routes/dashboard/calendar"
// import { ISOPage } from "./routes/dashboard/products/tools/iso";
// import { ERMPage } from "./routes/dashboard/products/tools/erm";
// import { PCIPage } from "./routes/dashboard/products/tools/pci";
import PCIPage from "./routes/dashboard/products/tools/pcipage";
import ISOPage from "./routes/dashboard/products/tools/isopage";
import ERMPage from "./routes/dashboard/products/tools/ermpage";
import RCPage from "./routes/dashboard/products/tools/rcpage";
import VulnerabilityPage from "./routes/dashboard/products/tools/vulnerabilitypage";
// import  { VulnerabilityPage } from "./routes/dashboard/products/tools/vulass";
// import { RCPage } from "./routes/dashboard/products/tools/rc";
// import Register from "./register/register";
import { Login } from "./register/login";
import { SignUp } from "./register/signup";
import UserSelection from "./register/userselection";
import { AdminLogin } from "./register/adminlog";
import { StandardsProvider } from "./contexts/standardscontext";


function App() {
    const router = createBrowserRouter([
        // Define the main route for the application
        {
            path: "/adminlog",
            element:<AdminLogin />
        },
        {
            path: "/user",
            element: <UserSelection />,
        },
         {
      path: "/login",
      element: <Login />, 
    },
    {
      path: "/signup",
      element: <SignUp />,
    },

        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "calendar",
                    element: <Calendar/>,
                },
                {
                    path: "reports",
                    element: <h1 className="title">Reports</h1>,
                },
                {
                     path: "customers",
                    element: <CustomersPage />,
                },
                {
                    path: "new-customer",
                    element: <NewCustomerPage />,
                },
                {
                    path: "verified-customers",
                    element: <h1 className="title">Verified Customers</h1>,
                },
                {
                    path: "Standards",
                    element: <Standards />
                },
                {
                    path: "new-standard",
                    element: <NewStandards />,
                },
                {
                    path: "standards",
                    children: [
            { path: "iso", element: <ISOPage /> },
            { path: "erm", element: <ERMPage /> },
            { path: "pci", element: <PCIPage /> },
            { path: "vulnerability", element: <VulnerabilityPage /> },
            { path: "regulatory-compliance", element: <RCPage /> },
          ],
                },
                {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
                },
            ],
        },
    ]);

    return (
         <StandardsProvider>
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
        </StandardsProvider>
    );
}

export default App;
