import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePrev, setImagePrev] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleSelectedImage = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith("image/")){
      toast.error("Please select an image file")
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePrev(reader.result);
    }
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setImagePrev(null);
    if(fileInputRef.current) fileInputRef.current.value = ""
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePrev) return;
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePrev,
      });

      //clear form after submit
      setText("");
      setImagePrev(null);
      if(fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.log("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePrev && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePrev}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-zinc-700"
            />
            <button
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
              onClick={removeSelectedImage}
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleSelectedImage}
          />

          <button type="button" className={`hidden sm:flex btn btn-circle ${imagePrev ? "text-emerald-500" : "text-zinc-400"}`}
          onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20}/>
          </button>
        </div>

        <button type="submit" disabled={!text.trim() && !imagePrev} className="btn btn-sm btn-circle">
          <Send size={22}/>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
