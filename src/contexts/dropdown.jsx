import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";

export const DropdownMenu = ({ item }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100">
        <div className="flex items-center gap-2">
          <item.icon className="h-5 w-5" />
          {item.label}
        </div>
        <ChevronDownIcon
          aria-hidden="true"
          className="-mr-1 size-5 text-gray-400"
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {item.submenu.map((subItem) => (
              <Menu.Item key={subItem.path}>
                {({ active }) => (
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) => 
                      `${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} 
                      block px-4 py-2 text-sm`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};