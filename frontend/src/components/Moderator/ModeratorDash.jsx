import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import styles from "./styles.module.css";
import { BASE_URL } from "../../api/axiosConfig";
import logo from '../../WhatsApp_Image_2025-07-07_at_03.47.17_5195f6a4-removebg-preview.png'
const ModeratorDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProperty, setEditingProperty] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unitType: "فيلا",
    area: "",
    phoneNumber: "",
    price: "",
    address: "",
    anotherInfo: "",
    features: "",
    status: "متوفر",
    ContractImage: null
  });

  useEffect(() => {
  const fetchProperties = async () => {
    try {
      const response = await api.get("/api/properties");
      console.log(response);

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

  const handleDeleteProperty = async (id) => {
  if (!window.confirm("هل أنت متأكد من حذف هذا العقار؟")) {
    return;
  }

  try {
    await api.delete(`/api/properties/${id}`);

    setProperties(properties.filter(property => property._id !== id));
  } catch (err) {
    setError("فشل في حذف العقار. يرجى المحاولة مرة أخرى");
    console.error("Delete property error:", err);
  }
};

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    console.log('Selected file:', e.target.files[0]); // Debugging
    setFormData({
      ...formData,
      ContractImage: e.target.files[0]
    });
  }
};

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields = ['unitType', 'area','price', 'phoneNumber', 'address'];
    const missingFields = requiredFields.filter(field => !formData[field]?.toString().trim());

    if (missingFields.length > 0) {
      setError(`الحقول التالية مطلوبة: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("يجب تسجيل الدخول أولاً");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('unitType', formData.unitType || '');
      formDataToSend.append('price', formData.price || '');
      formDataToSend.append('area', formData.area ? Number(formData.area) : '');
      formDataToSend.append('phoneNumber', formData.phoneNumber?.toString().trim() || '');
      formDataToSend.append('address', formData.address?.trim() || '');
      formDataToSend.append('status', formData.status || 'متوفر');

      if (formData.anotherInfo) {
        formDataToSend.append('anotherInfo', formData.anotherInfo.trim().replace(/http:\/\/localhost:4000\/api\/properties/g, ''));
      } else {
        formDataToSend.append('anotherInfo', '');
      }
      
      if (formData.features) {
        const featuresArray = formData.features
          .split(',')
          .map(item => item.trim())
          .filter(item => item);
        formDataToSend.append('features', JSON.stringify(featuresArray));
      } else {
        formDataToSend.append('features', JSON.stringify([]));
      }

      if (formData.ContractImage) {
        const validMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!validMimeTypes.includes(formData.ContractImage.type)) {
          setError("يجب أن يكون الملف من نوع JPEG, PNG أو PDF");
          return;
        }
        formDataToSend.append('ContractImage', formData.ContractImage);
      }

     const response = await api.post("/api/properties", formDataToSend, {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  timeout: 10000
});

      setProperties([response.data.data, ...properties]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });

      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || "فشل في إضافة العقار. يرجى المحاولة مرة أخرى";
      
      setError(errorMessage);
    }
  };

  const handleEditProperty = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("يجب تسجيل الدخول أولاً");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('unitType', formData.unitType || '');
      formDataToSend.append('price', formData.price || '');
      formDataToSend.append('area', formData.area ? Number(formData.area) : '');
      formDataToSend.append('phoneNumber', formData.phoneNumber || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('anotherInfo', formData.anotherInfo || '');
      formDataToSend.append('features', JSON.stringify(
        typeof formData.features === 'string' ? 
        formData.features.split(',').map(f => f.trim()) : 
        formData.features
      ));
      formDataToSend.append('status', formData.status || 'متوفر');

      if (formData.ContractImage instanceof File) {
        formDataToSend.append('ContractImage', formData.ContractImage);
      }

      const response = await api.put(
  `/api/properties/${editingProperty._id}`,
      formDataToSend,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 10000
  });


      setProperties(properties.map(p => 
        p._id === editingProperty._id ? response.data.data : p
      ));
      setEditingProperty(null);
      resetForm();
      
    } catch (err) {
      console.error("Edit property error:", {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });

      let errorMsg = "فشل في تعديل العقار";
      if (err.code === "ECONNREFUSED") {
        errorMsg = "لا يمكن الاتصال بالخادم. يرجى التحقق من تشغيل الخادم";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      unitType: "فيلا",
      area: "",
      phoneNumber: "",
      address: "",
      anotherInfo: "",
      features: "",
      status: "متوفر",
      ContractImage: null
    });
  };

  const startEditing = (property) => {
    setEditingProperty(property);
    setFormData({
      unitType: property.unitType,
      area: property.area,
      phoneNumber: property.phoneNumber,
      address: property.address,
      anotherInfo: property.anotherInfo,
      features: property.features.join(","),
      status: property.status,
      ContractImage: null
    });
  };

  const cancelEditing = () => {
    setEditingProperty(null);
    resetForm();
  };

  const cancelAdding = () => {
    setShowAddForm(false);
    resetForm();
  };

  return (
    <div className={styles.dashboard_container}>
      <div className={styles.content_wrapper}>
        {/* Rabstan Logo Header */}
        <div className={styles.logo_header}>
          <div className={styles.logo_container}>
            <h1 className={styles.company_name_arabic}>شركة رسيبشن</h1>
            <div className={styles.logo_divider}></div>
            <h2 className={styles.company_tagline}>RECEPTION</h2>
            <h3 className={styles.company_name_english}>REAL ESTATE INVESTMENT</h3>
            <p className={styles.company_subtitle}>الاستثمار والتسويق العقاري</p>
          </div>
        </div>

        <h1 className={styles.dashboard_title}>لوحة تحكم المشرف - إدارة العقارات</h1>
        
        <form onSubmit={handleSearch} className={styles.search_form}>
          <input
            type="text"
            placeholder="ابحث بأي جزء من العنوان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.search_input}
            dir="rtl"
          />
          <button type="submit" className={styles.search_btn}>
            بحث
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className={styles.add_btn}
          >
            إضافة عقار جديد
          </button>
        </form>

        {error && <div className={styles.error_msg}>{error}</div>}

        {showAddForm && (
          <div className={styles.form_modal}>
            <div className={styles.form_container}>
              <h2>إضافة عقار جديد</h2>
              <form onSubmit={handleAddProperty}>
                <div className={styles.form_group}>
                  <label>نوع الوحدة</label>
                  <select
                    name="unitType"
                    value={formData.unitType}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                  >
                    <option value="فيلا">فيلا</option>
                    <option value="شقة">شقة</option>
                    <option value="بيت">بيت</option>
                  </select>
                </div>

                <div className={styles.form_group}>
                  <label>المساحة (م²)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>رقم الهاتف</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>العنوان</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>السعر</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>معلومات إضافية</label>
                  <textarea
                    name="anotherInfo"
                    value={formData.anotherInfo}
                    onChange={handleInputChange}
                    className={styles.form_textarea}
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>المميزات (افصل بفواصل)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    placeholder="مسبح, حديقة, جراج"
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>الحالة</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.form_input}
                  >
                    <option value="متوفر">متوفر</option>
                    <option value="مستأجر">مستأجر</option>
                    <option value="مباع">مباع</option>
                    <option value="تحت الصيانة">تحت الصيانة</option>
                  </select>
                </div>

                <div className={styles.form_group}>
                  <label>صورة العقد (اختياري)</label>
                  <input
                    type="file"
                    name="ContractImage"
                    onChange={handleFileChange}
                    className={styles.form_input}
                    accept="image/*,.pdf"
                  />
                </div>

                <div className={styles.form_actions}>
                  <button type="submit" className={styles.submit_btn}>
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={cancelAdding}
                    className={styles.cancel_btn}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingProperty && (
          <div className={styles.form_modal}>
            <div className={styles.form_container}>
              <h2>تعديل العقار</h2>
              <form onSubmit={handleEditProperty}>
                <div className={styles.form_group}>
                  <label>نوع الوحدة</label>
                  <select
                    name="unitType"
                    value={formData.unitType}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                  >
                    <option value="فيلا">فيلا</option>
                    <option value="شقة">شقة</option>
                    <option value="بيت">بيت</option>
                  </select>
                </div>

                <div className={styles.form_group}>
                  <label>المساحة (م²)</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>رقم الهاتف</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>العنوان</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    required
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>معلومات إضافية</label>
                  <textarea
                    name="anotherInfo"
                    value={formData.anotherInfo}
                    onChange={handleInputChange}
                    className={styles.form_textarea}
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>المميزات (افصل بفواصل)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className={styles.form_input}
                    placeholder="مسبح, حديقة, جراج"
                    dir="rtl"
                  />
                </div>

                <div className={styles.form_group}>
                  <label>الحالة</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.form_input}
                  >
                    <option value="متوفر">متوفر</option>
                    <option value="مستأجر">مستأجر</option>
                    <option value="مباع">مباع</option>
                    <option value="تحت الصيانة">تحت الصيانة</option>
                  </select>
                </div>

                <div className={styles.form_group}>
                  <label>صورة العقد (اختياري)</label>
                  <input
                    type="file"
                    name="ContractImage"
                    onChange={handleFileChange}
                    className={styles.form_input}
                    accept="image/*,.pdf"
                  />
                  {editingProperty.ContractImage && (
                    <p className={styles.current_file}>
                      الملف الحالي: {editingProperty.ContractImage.split("/").pop()}
                    </p>
                  )}
                </div>

                <div className={styles.form_actions}>
                  <button type="submit" className={styles.submit_btn}>
                    حفظ التعديلات
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className={styles.cancel_btn}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    <span
                      className={`${styles.status} ${
                        styles[property.status.replace(" ", "_")]
                      }`}
                    >
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
                      <span className={styles.detail_label}>المميزات:</span>
                      <span>{property.features.join("، ")}</span>
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
      {property.ContractImage.toLowerCase().endsWith('.pdf') ? (
        <a
          href={`${BASE_URL}/uploads/${property.ContractImage.split('/').pop()}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contract_link}
        >
          عرض ملف العقد (PDF)
        </a>
      ) : (
        <img 
          src={`${BASE_URL}/uploads/${property.ContractImage.split('/').pop()}`} 
          alt="عقد العقار" 
          className={styles.contract_image}
          onError={(e) => {
            console.error('Error loading image:', e);
            e.target.onerror = null;
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      )}
    </div>
  </div>
)}

                  </div>

                  <div className={styles.property_actions}>
                    <button
                      onClick={() => startEditing(property)}
                      className={styles.edit_btn}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property._id)}
                      className={styles.delete_btn}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorDashboard;