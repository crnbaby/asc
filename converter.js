// converter.js ~ unit conversion module

class UnitConverter {
    constructor() {
        this.typeSelect = document.getElementById('converter-type');
        this.inputField = document.getElementById('converter-input');
        this.fromSelect = document.getElementById('converter-from');
        this.toSelect = document.getElementById('converter-to');
        this.resultDiv = document.getElementById('converter-result');

        // conversion units and factors (base unit conversion)
        this.units = {
            length: {
                name: 'Length',
                units: {
                    'meter': { name: 'Meter (m)', factor: 1 },
                    'kilometer': { name: 'Kilometer (km)', factor: 1000 },
                    'centimeter': { name: 'Centimeter (cm)', factor: 0.01 },
                    'millimeter': { name: 'Millimeter (mm)', factor: 0.001 },
                    'mile': { name: 'Mile (mi)', factor: 1609.344 },
                    'yard': { name: 'Yard (yd)', factor: 0.9144 },
                    'foot': { name: 'Foot (ft)', factor: 0.3048 },
                    'inch': { name: 'Inch (in)', factor: 0.0254 },
                    'nautical_mile': { name: 'Nautical Mile', factor: 1852 }
                }
            },
            weight: {
                name: 'Weight',
                units: {
                    'kilogram': { name: 'Kilogram (kg)', factor: 1 },
                    'gram': { name: 'Gram (g)', factor: 0.001 },
                    'milligram': { name: 'Milligram (mg)', factor: 0.000001 },
                    'metric_ton': { name: 'Metric Ton', factor: 1000 },
                    'pound': { name: 'Pound (lb)', factor: 0.453592 },
                    'ounce': { name: 'Ounce (oz)', factor: 0.0283495 },
                    'stone': { name: 'Stone', factor: 6.35029 }
                }
            },
            temperature: {
                name: 'Temperature',
                units: {
                    'celsius': { name: 'Celsius (°C)' },
                    'fahrenheit': { name: 'Fahrenheit (°F)' },
                    'kelvin': { name: 'Kelvin (K)' }
                },
                special: true
            },
            area: {
                name: 'Area',
                units: {
                    'sq_meter': { name: 'Square Meter (m²)', factor: 1 },
                    'sq_kilometer': { name: 'Square Kilometer (km²)', factor: 1000000 },
                    'sq_centimeter': { name: 'Square Centimeter (cm²)', factor: 0.0001 },
                    'hectare': { name: 'Hectare (ha)', factor: 10000 },
                    'acre': { name: 'Acre', factor: 4046.86 },
                    'sq_foot': { name: 'Square Foot (ft²)', factor: 0.092903 },
                    'sq_yard': { name: 'Square Yard (yd²)', factor: 0.836127 },
                    'sq_mile': { name: 'Square Mile (mi²)', factor: 2589988.11 }
                }
            },
            volume: {
                name: 'Volume',
                units: {
                    'liter': { name: 'Liter (L)', factor: 1 },
                    'milliliter': { name: 'Milliliter (mL)', factor: 0.001 },
                    'cubic_meter': { name: 'Cubic Meter (m³)', factor: 1000 },
                    'gallon_us': { name: 'Gallon (US)', factor: 3.78541 },
                    'gallon_uk': { name: 'Gallon (UK)', factor: 4.54609 },
                    'quart': { name: 'Quart (US)', factor: 0.946353 },
                    'pint': { name: 'Pint (US)', factor: 0.473176 },
                    'cup': { name: 'Cup (US)', factor: 0.236588 },
                    'fluid_oz': { name: 'Fluid Ounce (US)', factor: 0.0295735 }
                }
            },
            speed: {
                name: 'Speed',
                units: {
                    'mps': { name: 'Meters/second (m/s)', factor: 1 },
                    'kph': { name: 'Kilometers/hour (km/h)', factor: 0.277778 },
                    'mph': { name: 'Miles/hour (mph)', factor: 0.44704 },
                    'knot': { name: 'Knot', factor: 0.514444 },
                    'fps': { name: 'Feet/second (ft/s)', factor: 0.3048 },
                    'mach': { name: 'Mach (at sea level)', factor: 343 }
                }
            }
        };

        this.initialize();
    }

    initialize() {
        this.changeType();
    }

    changeType() {
        const type = this.typeSelect.value;
        const unitData = this.units[type];

        // clear and populate unit selects
        this.fromSelect.innerHTML = '';
        this.toSelect.innerHTML = '';

        Object.entries(unitData.units).forEach(([key, unit], index) => {
            const optionFrom = document.createElement('option');
            optionFrom.value = key;
            optionFrom.textContent = unit.name;
            this.fromSelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = key;
            optionTo.textContent = unit.name;
            // Select different default for "to"
            if (index === 1) optionTo.selected = true;
            this.toSelect.appendChild(optionTo);
        });

        this.convert();
    }

    convert() {
        const type = this.typeSelect.value;
        const value = parseFloat(this.inputField.value);
        const fromUnit = this.fromSelect.value;
        const toUnit = this.toSelect.value;

        if (isNaN(value)) {
            this.resultDiv.textContent = 'Result: --';
            return;
        }

        let result;

        if (type === 'temperature') {
            result = this.convertTemperature(value, fromUnit, toUnit);
        } else {
            result = this.convertStandard(value, type, fromUnit, toUnit);
        }

        // format result
        let formattedResult;
        if (Math.abs(result) < 0.0001 || Math.abs(result) >= 1e10) {
            formattedResult = result.toExponential(6);
        } else {
            formattedResult = parseFloat(result.toPrecision(10)).toString();
        }

        this.resultDiv.textContent = `Result: ${formattedResult}`;
    }

    convertStandard(value, type, fromUnit, toUnit) {
        const units = this.units[type].units;
        const fromFactor = units[fromUnit].factor;
        const toFactor = units[toUnit].factor;

        // convert to base unit, then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    }

    convertTemperature(value, fromUnit, toUnit) {
        // first convert to celsius
        let celsius;
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }

        // then convert from celsius to target
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9 / 5 + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }
}