import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Visit } from '@/lib/visits';

interface MapComponentProps {
	visits: Visit[];
	onMappedCount?: (count: number) => void;
}

interface Coordinate {
	lat: number;
	lng: number;
	visit: Visit;
}

// Geocoding function to convert address to coordinates
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
			{
				headers: {
					'User-Agent': 'ERP-System/1.0',
				},
			}
		);
		const data = await response.json();
		if (data && data.length > 0) {
			return {
				lat: parseFloat(data[0].lat),
				lng: parseFloat(data[0].lon),
			};
		}
		return null;
	} catch (error) {
		console.error('Geocoding error:', error);
		return null;
	}
};

export default function MapComponent({ visits, onMappedCount }: MapComponentProps) {
	const mapRef = useRef<L.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
	const [loading, setLoading] = useState(true);

	// Geocode addresses on mount
	useEffect(() => {
		const geocodeVisits = async () => {
			setLoading(true);
			const coords: Coordinate[] = [];

			for (const visit of visits) {
				// First try to parse as lat,lng
				const parts = visit.location.split(',').map((s) => s.trim());
				if (parts.length === 2) {
					const lat = parseFloat(parts[0]);
					const lng = parseFloat(parts[1]);
					if (!isNaN(lat) && !isNaN(lng)) {
						console.log(`✓ Visit "${visit.store}" has coordinates: ${lat}, ${lng}`);
						coords.push({ lat, lng, visit });
						continue;
					}
				}

				// If not coordinates, try geocoding the address
				console.log(`Geocoding address for "${visit.store}": ${visit.location}`);
				const geocoded = await geocodeAddress(visit.location);
				if (geocoded) {
					console.log(`✓ Geocoded "${visit.store}": ${geocoded.lat}, ${geocoded.lng}`);
					coords.push({ ...geocoded, visit });
					// Add small delay to respect rate limits
					await new Promise((resolve) => setTimeout(resolve, 1000));
				} else {
					console.warn(`✗ Failed to geocode "${visit.store}": ${visit.location}`);
				}
			}

			console.log(`Total visits: ${visits.length}, Successfully mapped: ${coords.length}`);
			setCoordinates(coords);
			setLoading(false);

			// Notify parent component of mapped count
			if (onMappedCount) {
				onMappedCount(coords.length);
			}
		};

		if (visits.length > 0) {
			geocodeVisits();
		} else {
			setLoading(false);
		}
	}, [visits, onMappedCount]);

	useEffect(() => {
		if (!mapContainerRef.current || loading) return;

		// If no valid coordinates, don't initialize map
		if (coordinates.length === 0) {
			if (mapContainerRef.current) {
				mapContainerRef.current.innerHTML = '<div class="h-full flex items-center justify-center text-gray-500">No valid location coordinates found</div>';
			}
			return;
		}

		// Initialize map only once
		if (!mapRef.current) {
			const map = L.map(mapContainerRef.current).setView(
				[coordinates[0].lat, coordinates[0].lng],
				13
			);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			}).addTo(map);

			mapRef.current = map;
		}

		// Clear existing markers and polylines
		mapRef.current.eachLayer((layer) => {
			if (layer instanceof L.Marker || layer instanceof L.Polyline) {
				mapRef.current?.removeLayer(layer);
			}
		});

		// Custom icon for markers
		const createNumberedIcon = (number: number) => {
			return L.divIcon({
				className: 'custom-div-icon',
				html: `
					<div style="
						background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
						width: 32px;
						height: 32px;
						border-radius: 50% 50% 50% 0;
						border: 3px solid white;
						transform: rotate(-45deg);
						display: flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
					">
						<span style="
							color: white;
							font-weight: bold;
							font-size: 14px;
							transform: rotate(45deg);
						">${number}</span>
					</div>
				`,
				iconSize: [32, 32],
				iconAnchor: [16, 32],
			});
		};

		// Add markers for each visit with slight offset for overlapping locations
		console.log('Adding markers to map:');
		const locationCounts = new Map<string, number>();

		coordinates.forEach((coord, index) => {
			let lat = coord.lat;
			let lng = coord.lng;

			// Create a key for this location
			const locationKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;

			// If we've seen this location before, add a small offset
			const count = locationCounts.get(locationKey) || 0;
			if (count > 0) {
				// Offset by 0.0001 degrees (~11 meters) in a circular pattern
				const angle = (count * 2 * Math.PI) / 6; // Distribute up to 6 markers in a circle
				const offset = 0.0001;
				lat += offset * Math.cos(angle);
				lng += offset * Math.sin(angle);
				console.log(`  Marker ${index + 1} "${coord.visit.store}": OFFSET from ${locationKey} to ${lat}, ${lng} (overlap #${count})`);
			} else {
				console.log(`  Marker ${index + 1} "${coord.visit.store}": ${lat}, ${lng}`);
			}
			locationCounts.set(locationKey, count + 1);

			const marker = L.marker([lat, lng], {
				icon: createNumberedIcon(index + 1),
			}).addTo(mapRef.current!);

			const startTime = new Date(coord.visit.startTime).toLocaleTimeString('id-ID', {
				hour: '2-digit',
				minute: '2-digit',
			});
			const endTime = coord.visit.endTime
				? new Date(coord.visit.endTime).toLocaleTimeString('id-ID', {
						hour: '2-digit',
						minute: '2-digit',
				  })
				: 'Ongoing';

			marker.bindPopup(`
				<div style="min-width: 200px;">
					<h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">#${index + 1}: ${coord.visit.store}</h3>
					<p style="margin: 4px 0; color: #4b5563; font-size: 14px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
					<p style="margin: 4px 0; color: #4b5563; font-size: 14px;"><strong>Location:</strong> ${coord.visit.location}</p>
					${coord.visit.description ? `<p style="margin: 4px 0; color: #4b5563; font-size: 14px;"><strong>Description:</strong> ${coord.visit.description}</p>` : ''}
				</div>
			`);
		});

		// Draw path connecting visits in order
		if (coordinates.length > 1) {
			const latlngs = coordinates.map((coord) => [coord.lat, coord.lng] as [number, number]);
			L.polyline(latlngs, {
				color: '#3b82f6',
				weight: 3,
				opacity: 0.7,
				dashArray: '10, 10',
			}).addTo(mapRef.current);
		}

		// Fit map to show all markers
		if (coordinates.length > 0) {
			const bounds = L.latLngBounds(coordinates.map((coord) => [coord.lat, coord.lng]));
			mapRef.current.fitBounds(bounds, { padding: [50, 50] });
		}

		// Cleanup function
		return () => {
			// Don't destroy the map, just clear markers
		};
	}, [coordinates, loading]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, []);

	if (loading) {
		return (
			<div className="h-[600px] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
				<div className="inline-flex items-center space-x-3">
					<div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
					<span className="text-gray-600">Geocoding addresses...</span>
				</div>
			</div>
		);
	}

	return <div ref={mapContainerRef} className="h-[600px] rounded-2xl overflow-hidden" />;
}
