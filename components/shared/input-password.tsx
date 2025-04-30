import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff } from 'lucide-react';

const InputPassword = ({
  defaultValue,
  name,
  label,
}: {
  defaultValue: string;
  name: string;
  label: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='relative'>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={showPassword ? 'text' : 'password'}
        required
        autoComplete='password'
        defaultValue={defaultValue}
        className='pr-10' // add padding to avoid overlapping icon
      />
      <button
        type='button'
        onClick={togglePassword}
        className='absolute inset-y-[34px] right-3'
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default InputPassword;
