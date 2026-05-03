export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset!);
  fd.append("folder", `manific/${folder}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload hatası: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.secure_url;
}
