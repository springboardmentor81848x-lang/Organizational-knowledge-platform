function Button({ text, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition ${className}`}
    >
      {text}
    </button>
  );
}

export default Button;