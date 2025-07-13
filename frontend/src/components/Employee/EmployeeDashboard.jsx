import { useState, useEffect } from "react";
import api, { BASE_URL } from "../../api/axiosConfig";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import logo from '../../WhatsApp_Image_2025-07-07_at_03.47.17_5195f6a4-removebg-preview.png';

const EmployeeDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/properties");
        setProperties(response.data.data);
        setIsLoading(false);
      } catch (err) {
        setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        console.error("Error fetching properties:", err);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      try {
        const response = await api.get("/api/properties");
        setProperties(response.data.data);
      } catch (err) {
        setError("فشل في تحميل البيانات");
        console.error("Error:", err);
      }
      return;
    }

    try {
      const response = await api.get(`/api/properties?address=${encodeURIComponent(searchTerm)}`);
      setProperties(response.data.data);
    } catch (err) {
      setError("فشل في البحث. يرجى المحاولة مرة أخرى");
      console.error("Search error:", err);
    }
  };

  return (
    <div className={styles.dashboard_wrapper}>
      <div className={styles.dashboard_container} dir="rtl">
        <div className={styles.logo_header}>
          <img src={logo} alt="Company Logo" className={styles.logo} />
          <div className={styles.company_info}>
            <h1 className={styles.company_name}>شركة ربستان العقارية</h1>
            <p className={styles.company_slogan}>الحلول العقارية المتكاملة</p>
          </div>
        </div>

        <div className={styles.content_wrapper}>
          <h1 className={styles.dashboard_title}>لوحة تحكم الموظف - إدارة العقارات</h1>

          <form onSubmit={handleSearch} className={styles.search_form}>
            <input
              type="text"
              placeholder="ابحث بأي جزء من العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.search_input}
            />
            <button type="submit" className={styles.search_btn}>بحث</button>
          </form>

          {error && <div className={styles.error_msg}>{error}</div>}

          {isLoading ? (
            <div className={styles.loading}>جاري التحميل...</div>
          ) : (
            <div className={styles.properties_container}>
              {properties.length === 0 ? (
                <div className={styles.no_results}>لا توجد عقارات متاحة</div>
              ) : (
                properties.map((property) => (
                  <div key={property._id} className={styles.property_card}>
                    <div className={styles.property_header}>
                      <h3>
                        {property.unitType} - {property.address}
                      </h3>
                      <span className={`${styles.status} ${styles[property.status.replace(" ", "_")]}`}>
                        {property.status}
                      </span>
                    </div>

                    <div className={styles.property_details}>
                      <div className={styles.detail_item}>
                        <span className={styles.detail_label}>المساحة:</span>
                        <span>{property.area} م²</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.detail_label}>رقم الهاتف:</span>
                        <span>{property.phoneNumber}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.detail_label}>السعر:</span>
                        <span>{property.price}</span>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.detail_label}>المميزات:</span>
                        <div className={styles.features_container}>
                          {property.features.map((feature, index) => (
                            <span key={index} className={styles.feature_circle}>
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.detail_item}>
                        <span className={styles.detail_label}>العنوان:</span>
                        <span>{property.address}</span>
                      </div>
                      {property.anotherInfo && (
                        <div className={styles.detail_item}>
                          <span className={styles.detail_label}>ملاحظات:</span>
                          <span>{property.anotherInfo}</span>
                        </div>
                      )}
                      {property.ContractImage && (
                        <div className={styles.detail_item}>
                          <span className={styles.detail_label}>ملف العقد:</span>
                          <div className={styles.image_preview_container}>
                            {(() => {
                              const imageUrl = `${BASE_URL}/uploads/${property.ContractImage.split('/').pop()}`;
                              if (property.ContractImage.match(/\.(jpeg|jpg|png|webp)$/i)) {
                                return (
                                  <img 
                                    src={imageUrl}
                                    alt="عقد العقار"
                                    className={styles.contract_image}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/images/document-placeholder.png';
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <div className={styles.document_preview}>
                                    <span className={styles.document_icon}>📄</span>
                                    <span className={styles.document_text}>
                                      {property.ContractImage.split('/').pop()}
                                    </span>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
