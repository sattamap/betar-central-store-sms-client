import useAxiosPublic from "../hooks/useAxiosPublic";

const useDownloadPDF = () => {
  const axiosPublic = useAxiosPublic(); // ✅ use it inside a hook

  const downloadPDF = async (services, filename = "bangla-service-report") => {
    try {
      const response = await axiosPublic.post(
        "/services/generate-pdf",
        { services, filename },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
    }
  };

  return downloadPDF;
};

export default useDownloadPDF;
