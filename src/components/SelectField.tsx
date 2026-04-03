import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export interface SelectOption {
    id: number;
    name: string;
}

interface SelectFieldProps {
    label: string;
    options: SelectOption[];
    value: number;
    onChange: (value: number) => void;
    icon: any;
    placeholder: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange, icon, placeholder }) => {
    const selected = options.find((opt) => opt.id === value);

    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative group">
                <Listbox.Label className="text-[10px] font-bold text-teal-600 uppercase ml-4 mb-1 block">
                    {label}
                </Listbox.Label>
                <div className="relative">
                    <Listbox.Button className="relative w-full pl-11 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-gray-700 text-left cursor-pointer shadow-xs">
                        <span className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                            <FontAwesomeIcon icon={icon} className="text-xs" />
                        </span>
                        <span className="block truncate">
                            {selected && selected.id !== 0 ? selected.name : <span className="text-gray-400 font-medium">{placeholder}</span>}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" aria-hidden="true" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={React.Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-70 mt-2 max-h-60 w-full overflow-auto rounded-3xl bg-white py-2 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm border border-gray-100">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-3.5 pl-11 pr-4 transition-all ${
                                            active ? 'bg-teal-50 text-teal-900 px-5' : 'text-gray-900'
                                        }`
                                    }
                                    value={option.id}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-black text-teal-600' : 'font-bold text-gray-600'}`}>
                                                {option.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-4 flex items-center text-teal-600">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </div>
        </Listbox>
    );
};
