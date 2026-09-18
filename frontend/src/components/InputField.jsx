function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  className = "",
}) {
  return (
    <div>
      <label className="block mb-2 font-medium text-sm">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:shadow-md transition duration-200 ease-in-out bg-white ${className}`}
      />
    </div>
  );
}

export default InputField;
