import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure this path is correct for your global CSS

function CreatePostModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto'; // Restore scrolling
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-2xl transition-all duration-300 p-4"> {/* Added p-4 for padding on smaller screens */}
      <div
        ref={modalRef}
        className="w-full lg:w-3/4 md:w-11/12 max-h-[90vh] rounded-2xl bg-card backdrop-blur-xl p-6 shadow-2xl flex flex-col" // Changed h-screen to max-h-[90vh], bg-yellow-400 to bg-card, and added flex flex-col
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-theme">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-theme hover:text-red-500 transition-colors" // Changed text-white to text-theme
          >
            ×
          </button>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar"> {/* Added flex-grow and overflow-y-auto */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;