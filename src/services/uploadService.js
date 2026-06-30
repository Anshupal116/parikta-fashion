const API_URL = `${import.meta.env.VITE_API_URL}/upload`;

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/image`, {
    method: "POST",
    body: formData,
  });

  return await res.json();
};