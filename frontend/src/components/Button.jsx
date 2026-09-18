function Button({ text, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transform active:scale-95 active:shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    >
      {text}
    </button>
  );
}

export default Button;