

const WelcomeMsg = () => {
    return (
       <div>
         <div className="w-2/3 mx-auto p-10  mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">
                Welcome to Our App!
            </h2>
            <p className="text-lg text-gray-700 mb-4">
                You have just created an account and currently do not have a role assigned.
                An admin will reach out soon to assign you a role based on your preferences and needs.
            </p>
            <p className="text-lg text-gray-700">
                In the meantime, enjoy exploring our app and feel free to reach out to support if you have any questions.
            </p>
            
        </div>
             {/* Footer with copyright information */}
             <footer className="mt-12 lg:mt-64 text-center text-gray-600 text-sm">
             &copy; {new Date().getFullYear()} Inventory Management System of Bangladesh Betar, Bandarban. All rights reserved.
             <br />Developed by Sattam.
         </footer>
       </div>
    );
};

export default WelcomeMsg;
