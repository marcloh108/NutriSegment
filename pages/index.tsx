
import { useEffect, useState } from "react";
import getImageURL from "../src/firebaseClient";  // <-- default import

const Dashboard = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchImages() {
      // 🔧 Replace with actual file paths inside your Firebase bucket
      const paths = [
        "uploads/example.jpg",
        "uploads/test1.png",
        "uploads/test2.png",
      ];

      const urls = await Promise.all(paths.map((p) => getImageURL(p)));
      setImageUrls(urls);
    }
    fetchImages();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Firebase Image Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {imageUrls.map((url, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
            <img src={url} alt={`firebase-img-${i}`} style={{ width: "100%", height: "auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
