const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'font-medium rounded-lg focus:outline-none transition-all flex items-center justify-center';
  const variants = {
    // Diubah jadi merah Bos Mentai
    primary: 'bg-[#B34949] hover:bg-[#8B2323] text-white shadow-md', 
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    // Varian khusus sidebar (transparan saat tidak dipilih)
    ghost: 'hover:bg-red-50 text-gray-600 hover:text-[#B34949]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
