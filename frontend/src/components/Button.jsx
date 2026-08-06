function Button({ text, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition ${className}`}
    >
      {text}
    </button>
  );
}

export default Button;