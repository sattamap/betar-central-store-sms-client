import emailjs from "@emailjs/browser";
import { useRef } from "react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_0l5oujq",
        "template_fu1g1s9",
        form.current,
        "WjPcXt_HIonLof-9E"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };
  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="w-1/2 flex flex-col gap-8 justify-center items-center text-center lg:text-left">
            <h3 className="text-2xl font-bold">Lets Connect</h3>
            <p className="text-base font-medium">
              Please fill out the form on this section to contact with me or
              call between 9:00 A.M and 8.00 P.M .
            </p>
            <div className=" ">
              <div className="flex flex-row gap-4 text-4xl font-bold mb-4">
                <a href="https://github.com/sattamap">
                  <FaGithub></FaGithub>
                </a>
                <a href="https://www.linkedin.com/in/sattam-chakma-3ab64396">
                  <FaLinkedinIn></FaLinkedinIn>
                </a>
                <a href="https://www.instagram.com/sattamchakma">
                  <FaInstagram></FaInstagram>
                </a>
              </div>
              <div className=" flex items-center gap-2 text-2xl font-bold ">
                <FaWhatsapp></FaWhatsapp>
                <div className="w-full">
                  <p className="text-xs md:text-base">+880-185-8271527</p>
                </div>
              </div>
            </div>
            <Link to="/" className="block text-blue-500 hover:underline mt-4">
              &larr; Back to Login Page
            </Link>{" "}
            {/* Add Link component for back to dashboard */}
          </div>
          <div className="card  shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form ref={form} onSubmit={sendEmail} className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="user_name"
                  placeholder="Your Name"
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="user_email"
                  placeholder="Your Email"
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Message</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  name="message"
                  placeholder="Message"
                ></textarea>
              </div>
              <div className="form-control mt-6">
                <button className="btn bg-emerald-600">
                  <input type="submit" value="Send" />
                </button>
              </div>
            </form>
            <div className="mt-10 text-center text-xs text-gray-500">
              <p>
                Developed & Maintained by{" "}
                <a
                  href="https://sattam-portfolio.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Sattam Chakma
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
