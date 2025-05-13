// src/components/products/ProductSizeGuide.tsx - Updated with actual measurements for all products
import React from "react"
import { X } from "lucide-react"

interface ProductSizeGuideProps {
  productHandle: string
  onClose: () => void
}

interface SizeGuideData {
  title: string
  columns: string[]
  sizes: Array<{
    size: string
    measurements: string[]
  }>
}

// Helper function to convert inches to centimeters
const inchToCm = (inches: number): number => {
  return Math.round(inches * 2.54 * 10) / 10;
};

// Helper function to format measurement with both inches and cm
const formatMeasurement = (inches: number): string => {
  const cm = inchToCm(inches);
  return `${inches}"/~${cm} CM`;
};

// Helper function to determine which size guide to use based on the product handle
const getSizeGuideData = (productHandle: string): SizeGuideData => {
  // Convert handle to uppercase for easier comparison
  const handle = productHandle.toUpperCase();

  // Pants size guide (PC-SS-P23)
  if (handle.includes("PC-SS-P23")) {
    return {
      title: "PANTS SIZE GUIDE",
      columns: ["Size", "Waist", "Length", "Hem", "Inseam"],
      sizes: [
        { size: "XS", measurements: ["14\"/35.5 CM", "40\"/101.5 CM", "40\"/101.5 CM", "31\"/79 CM"] },
        { size: "S", measurements: ["14.5\"/37 CM", "40.5\"/103 CM", "40.5\"/103 CM", "31.5\"/80 CM"] },
        { size: "M", measurements: ["15\"/38 CM", "41\"/104 CM", "41\"/104 CM", "32\"/81 CM"] },
        { size: "L", measurements: ["15.5\"/39.5 CM", "41.5\"/105.5 CM", "41.5\"/105.5 CM", "32.5\"/82.5 CM"] }
      ]
    };
  }

  // Jacket size guide (PC-SS-J25)
  else if (handle.includes("PC-SS-J25")) {
    return {
      title: "JACKET SIZE GUIDE",
      columns: ["Size", "Hem", "Pit to Pit", "Length", "Sleeve"],
      sizes: [
        { size: "S", measurements: [
          formatMeasurement(22),
          formatMeasurement(24),
          formatMeasurement(25),
          formatMeasurement(32)
        ]},
        { size: "M", measurements: [
          formatMeasurement(22.5),
          formatMeasurement(24.5),
          formatMeasurement(25.5),
          formatMeasurement(32.5)
        ]},
        { size: "L", measurements: [
          formatMeasurement(23),
          formatMeasurement(25),
          formatMeasurement(26),
          formatMeasurement(33)
        ]}
      ]
    };
  }

  // Shirt size guide (PC-SS-SS25)
  else if (handle.includes("PC-SS-SS25")) {
    return {
      title: "SHIRT SIZE GUIDE",
      columns: ["Size", "Hem", "Pit to Pit", "Length", "Sleeve"],
      sizes: [
        { size: "S", measurements: [
          formatMeasurement(21),
          formatMeasurement(23.5),
          formatMeasurement(25.5),
          formatMeasurement(19)
        ]},
        { size: "M", measurements: [
          formatMeasurement(21.5),
          formatMeasurement(24),
          formatMeasurement(26),
          formatMeasurement(19.5)
        ]},
        { size: "L", measurements: [
          formatMeasurement(22),
          formatMeasurement(24.5),
          formatMeasurement(26.5),
          formatMeasurement(20)
        ]}
      ]
    };
  }

  // Tie size guide (PC-SS-T25)
  else if (handle.includes("PC-SS-T25")) {
    return {
      title: "TIE SIZE GUIDE",
      columns: ["Size", "Length"],
      sizes: [
        { size: "ONE SIZE", measurements: ["59\"/150 CM"] }
      ]
    };
  }

  // Default/fallback size guide for other products
  return {
    title: "SIZE GUIDE",
    columns: ["Size", "Measurement"],
    sizes: [
      { size: "S", measurements: ["Standard"] },
      { size: "M", measurements: ["Standard"] },
      { size: "L", measurements: ["Standard"] }
    ]
  };
}

const ProductSizeGuide: React.FC<ProductSizeGuideProps> = ({ productHandle, onClose }) => {
  const sizeGuideData = getSizeGuideData(productHandle);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-laboratory-white p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm tracking-wide">{sizeGuideData.title}</h2>
          <button onClick={onClose} className="text-laboratory-black">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs tracking-wide">
            <thead>
              <tr>
                {sizeGuideData.columns.map((column, index) => (
                  <th key={index} className="py-2 px-3 border-b border-laboratory-black/10 text-left">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeGuideData.sizes.map((sizeRow, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-laboratory-black/5' : ''}>
                  <td className="py-2 px-3 font-medium">{sizeRow.size}</td>
                  {sizeRow.measurements.map((measurement, colIndex) => (
                    <td key={colIndex} className="py-2 px-3">
                      {measurement}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ProductSizeGuide