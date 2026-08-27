import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { assets } from '@/assets/assets'

const Sidebar = () => {
  const pathname = usePathname()

  const sidebarMenu = [
    { name: 'Add Product', path: '/seller', icon: assets.add_icon },
    { name: 'Product List', path: '/seller/product-list', icon: assets.product_list_icon },
    { name: 'Orders', path: '/seller/orders', icon: assets.order_icon },
  ]

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-300 py-2 flex flex-col'>
      {sidebarMenu.map((item) => {
        const isSelected = pathname === item.path
        return (
          <Link
            href={item.path}
            key={item.name}
            className={`flex items-center gap-3 py-3 px-4 md:px-8 ${
              isSelected ? 'border-r-4 md:border-r-[6px] bg-orange-600/10 border-orange-500/90 text-orange-500' : 'hover:bg-gray-100/90 border-r-4 md:border-r-[6px] border-white'
            }`}
          >
            <Image className='w-7 h-7' src={item.icon} alt={item.name} />
            <p className='md:block hidden text-center'>{item.name}</p>
          </Link>
        )
      })}
    </div>
  )
}

export default Sidebar
