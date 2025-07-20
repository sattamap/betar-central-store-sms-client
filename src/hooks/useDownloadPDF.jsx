import useAxiosPublic from "../hooks/useAxiosPublic";

const useDownloadPDF = () => {
  const axiosPublic = useAxiosPublic();

  const downloadPDF = async (data, type = "services", filename = `${type}-report`) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Invalid or empty data provided for PDF generation.");
      return;
    }

    try {
      const response = await axiosPublic.post(
        "/generate-pdf",
        { data, type, filename },
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
