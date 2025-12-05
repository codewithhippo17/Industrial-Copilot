#!/usr/bin/env python3
"""
Data Server - Real-time GTA Data Streaming
==========================================

Simulates real-time industrial data streaming by sending data from data.csv
as JSON files every 30 seconds. Mimics IRL SCADA/DCS data transmission.

Author: Digital Twin Team
Date: December 2025
"""

import pandas as pd
import json
import time
import os
from datetime import datetime, timedelta
import random
import threading
import signal
import sys

class GTADataServer:
    """Real-time data server for GTA optimization"""
    
    def __init__(self, data_file='data.csv', output_dir='realtime_data'):
        self.data_file = data_file
        self.output_dir = output_dir
        self.running = False
        self.data = None
        self.current_index = 0
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load historical data
        self.load_data()
        
    def load_data(self):
        """Load and prepare historical data"""
        try:
            print("📊 Loading historical data...")
            self.data = pd.read_csv(self.data_file)
            
            # Clean data (same as in your notebook)
            self.data = self.data[self.data['Admission_HP_GTA_1'] > 20]
            self.data = self.data[self.data['Admission_HP_GTA_2'] > 10] 
            self.data = self.data[self.data['Admission_HP_GTA_3'] > 10]
            self.data = self.data[self.data['Prod_EE_GTA_3'] >= 0]
            
            print(f"✅ Loaded {len(self.data)} data points")
            print(f"📈 Data columns: {list(self.data.columns)}")
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            sys.exit(1)
    
    def add_realistic_noise(self, value, noise_percent=2):
        """Add small random noise to simulate real sensor variations"""
        noise = random.uniform(-noise_percent/100, noise_percent/100)
        return value * (1 + noise)
    
    def get_current_data_point(self):
        """Get current data point with realistic variations"""
        if self.data is None or len(self.data) == 0:
            return None
        
        # Get base data point
        row = self.data.iloc[self.current_index % len(self.data)]
        
        # Add realistic noise to simulate real-time variations
        current_data = {
            "timestamp": datetime.now().isoformat(),
            "data_source": "GTA_SCADA_Simulator",
            "sample_id": self.current_index + 1,
            
            # GTA 1 Data
            "gta1": {
                "hp_admission": round(self.add_realistic_noise(row['Admission_HP_GTA_1']), 2),
                "mp_soutirage": round(self.add_realistic_noise(row['Soutirage_MP_GTA_1']), 2),
                "power_production": round(self.add_realistic_noise(row['Prod_EE_GTA_1']), 2),
                "status": "online"
            },
            
            # GTA 2 Data  
            "gta2": {
                "hp_admission": round(self.add_realistic_noise(row['Admission_HP_GTA_2']), 2),
                "mp_soutirage": round(self.add_realistic_noise(row['Soutirage_MP_GTA_2']), 2), 
                "power_production": round(self.add_realistic_noise(row['Prod_EE_GTA2_2']), 2),
                "status": "online"
            },
            
            # GTA 3 Data
            "gta3": {
                "hp_admission": round(self.add_realistic_noise(row['Admission_HP_GTA_3']), 2),
                "mp_soutirage": round(self.add_realistic_noise(row['Soutirage_MP_GTA_3']), 2),
                "power_production": round(self.add_realistic_noise(row['Prod_EE_GTA_3']), 2),
                "status": "online"
            },
            
            # Plant totals
            "plant_totals": {
                "total_hp_steam": 0,
                "total_mp_steam": 0, 
                "total_power": 0,
                "overall_efficiency": 0
            }
        }
        
        # Calculate totals
        current_data["plant_totals"]["total_hp_steam"] = (
            current_data["gta1"]["hp_admission"] + 
            current_data["gta2"]["hp_admission"] + 
            current_data["gta3"]["hp_admission"]
        )
        
        current_data["plant_totals"]["total_mp_steam"] = (
            current_data["gta1"]["mp_soutirage"] + 
            current_data["gta2"]["mp_soutirage"] + 
            current_data["gta3"]["mp_soutirage"]
        )
        
        current_data["plant_totals"]["total_power"] = (
            current_data["gta1"]["power_production"] + 
            current_data["gta2"]["power_production"] + 
            current_data["gta3"]["power_production"]
        )
        
        # Calculate efficiency (avoid division by zero)
        if current_data["plant_totals"]["total_hp_steam"] > 0:
            current_data["plant_totals"]["overall_efficiency"] = round(
                current_data["plant_totals"]["total_power"] / current_data["plant_totals"]["total_hp_steam"], 4
            )
        
        return current_data
    
    def save_data_point(self, data):
        """Save current data point as JSON file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"gta_data_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        try:
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
            
            print(f"📡 Data sent: {filename}")
            print(f"   Total Power: {data['plant_totals']['total_power']:.1f} MW")
            print(f"   Total MP: {data['plant_totals']['total_mp_steam']:.1f} T/h")
            
            # Keep only the last 10 files to avoid filling disk
            self.cleanup_old_files()
            
        except Exception as e:
            print(f"❌ Error saving data: {e}")
    
    def cleanup_old_files(self, keep_last=10):
        """Remove old data files, keep only the most recent"""
        try:
            files = [f for f in os.listdir(self.output_dir) if f.startswith('gta_data_') and f.endswith('.json')]
            files.sort(reverse=True)  # Most recent first
            
            # Remove old files
            for old_file in files[keep_last:]:
                old_path = os.path.join(self.output_dir, old_file)
                os.remove(old_path)
                
        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")
    
    def start_streaming(self, interval_seconds=30):
        """Start the real-time data streaming"""
        print("🚀 Starting GTA Data Server...")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"⏱️ Streaming interval: {interval_seconds} seconds")
        print("🛑 Press Ctrl+C to stop")
        print("="*50)
        
        self.running = True
        
        try:
            while self.running:
                # Get current data point
                data_point = self.get_current_data_point()
                
                if data_point:
                    # Save as JSON file
                    self.save_data_point(data_point)
                    
                    # Move to next data point
                    self.current_index += 1
                    
                    # Wait for next interval
                    time.sleep(interval_seconds)
                else:
                    print("❌ No data available")
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping data server...")
            self.running = False
        except Exception as e:
            print(f"❌ Server error: {e}")
            self.running = False
    
    def stop_streaming(self):
        """Stop the data streaming"""
        self.running = False
        print("✅ Data server stopped")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n🛑 Received stop signal...")
    global server
    if server:
        server.stop_streaming()
    sys.exit(0)

# Global server instance for signal handling
server = None

def main():
    """Main server function"""
    global server
    
    # Setup signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create and start server
    server = GTADataServer(
        data_file='data.csv',
        output_dir='realtime_data'
    )
    
    # Start streaming (30 seconds interval)
    server.start_streaming(interval_seconds=30)

if __name__ == "__main__":
    print("🏭 GTA Real-time Data Server")
    print("🔄 Simulating industrial SCADA data transmission")
    print("📊 Data source: data.csv")
    print()
    
    main()