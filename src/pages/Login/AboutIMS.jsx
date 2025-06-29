import { Link } from 'react-router-dom';

const AboutIMS = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-md text-justify">
                <Link to="/" className="block text-blue-500 hover:underline mb-4">&larr; Back to Login Page</Link>
                <h2 className="text-2xl font-semibold mb-4">About Inventory Management System (IMS)</h2>
                <p className="mb-4">
                The Inventory Management System (IMS) is a web application designed for managing items in the Bangladesh Betar Bandarban office. Developed by Sattam, this system helps categorize items stored in the office-store and manages items stored in different office locations, providing an efficient way to organize and monitor inventory.
                </p>
                <p className="mb-4">
                    The system supports four types of users, each with different levels of access and functionality:
                </p>
                <ul className="list-disc pl-8 mb-4">
                    <li><strong>Admin:</strong> Admin users have full control over the system. They can manage users, assign roles, and perform all the tasks available to Coordinators. Additionally, Admins can change user roles and handle advanced administrative tasks.</li>
                    <li><strong>Coordinator:</strong> Coordinator users can add, edit, and remove items. They also have all the permissions of a Monitor, allowing them to view item details such as name, quantity, location, condition, detail, and image.</li>
                    <li><strong>Monitor:</strong> Monitor users can view item details, including name, quantity, location, condition, detail, and image. However, they do not have the permission to add, edit, or remove items.</li>
                    <li><strong>No Role:</strong> Users with no assigned role cannot access or perform any actions within the system. When a user registers for the first time, their status is set to No Role by default. Only Admin users can change the roles of other users.</li>
                </ul>
                <p>
                    This system streamlines inventory management and improves efficiency in organizing and tracking items across different locations in the office.
                </p>
            </div>
        </div>
    );
};

export default AboutIMS;
