#!/usr/bin/env python3
"""
GTA Optimizer - Real-time Optimization Engine  
=============================================

Responds to optimization requests using trained ML models.
Provides optimal operating parameters for different scenarios.

Author: Digital Twin Team
Date: December 2025
"""

import pandas as pd
import numpy as np
import json
import joblib
import os
import glob
from datetime import datetime
import warnings

# Suppress ML warnings
warnings.filterwarnings('ignore')

class GTAOptimizer:
    """Real-time optimization engine for GTA plant"""
    
    def __init__(self, model_dir='model_gta', data_dir='realtime_data'):
        self.model_dir = model_dir
        self.data_dir = data_dir
        self.models = {}
        self.current_data = None
        
        # Load ML models
        self.load_models()
        
    def load_models(self):
        """Load all trained ML models"""
        try:
            print("🤖 Loading trained ML models...")
            
            # Load power prediction models
            self.models['power'] = {
                1: joblib.load(os.path.join(self.model_dir, 'model_power_gta1.pkl')),
                2: joblib.load(os.path.join(self.model_dir, 'model_power_gta2.pkl')),
                3: joblib.load(os.path.join(self.model_dir, 'model_power_gta3.pkl'))
            }
            
            # Load soutirage prediction models
            self.models['soutirage'] = {
                1: joblib.load(os.path.join(self.model_dir, 'model_soutirage_gta1.pkl')),
                2: joblib.load(os.path.join(self.model_dir, 'model_soutirage_gta2.pkl')),
                3: joblib.load(os.path.join(self.model_dir, 'model_soutirage_gta3.pkl'))
            }
            
            print("✅ All models loaded successfully")
            print(f"   - Power models: GTA 1, 2, 3")
            print(f"   - Soutirage models: GTA 1, 2, 3")
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            raise
    
    def get_latest_data(self):
        """Get the most recent data from server"""
        try:
            # Find the latest JSON file
            json_files = glob.glob(os.path.join(self.data_dir, 'gta_data_*.json'))
            
            if not json_files:
                print("⚠️ No data files found")
                return None
            
            # Get the most recent file
            latest_file = max(json_files, key=os.path.getctime)
            
            with open(latest_file, 'r') as f:
                data = json.load(f)
            
            self.current_data = data
            print(f"📊 Loaded data from: {os.path.basename(latest_file)}")
            return data
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return None
    
    def predict_gta_performance(self, hp_input, mp_soutirage, gta_number):
        """Predict GTA performance using trained models"""
        try:
            # Ensure valid inputs
            hp_input = max(0, float(hp_input))
            mp_soutirage = max(0, float(mp_soutirage))
            mp_soutirage = min(mp_soutirage, hp_input * 0.8)  # Physical constraint
            
            # Predict power
            X_power = np.array([[hp_input, mp_soutirage]])
            predicted_power = self.models['power'][gta_number].predict(X_power)[0]
            predicted_power = max(0, predicted_power)
            
            # Predict MP soutirage
            X_soutirage = np.array([[hp_input, predicted_power]])
            predicted_mp = self.models['soutirage'][gta_number].predict(X_soutirage)[0]
            predicted_mp = max(0, predicted_mp)
            
            return predicted_power, predicted_mp
            
        except Exception as e:
            print(f"❌ Prediction error for GTA_{gta_number}: {e}")
            # Return safe estimates
            return hp_input * 0.6, mp_soutirage
    
    def optimize_scenario_1_reduce_sulfuric(self, reduction_percent=20):
        """
        Scenario 1: Réduire la cadence sulfurique de 20%
        Less sulfuric acid production = less MP steam needed
        """
        print(f"🧪 OPTIMIZATION: Réduction cadence sulfurique de {reduction_percent}%")
        print("="*60)
        
        if not self.current_data:
            return None
        
        # Current baseline
        baseline = {
            'gta1': self.current_data['gta1'],
            'gta2': self.current_data['gta2'], 
            'gta3': self.current_data['gta3']
        }
        
        # Calculate current totals
        current_power = self.current_data['plant_totals']['total_power']
        current_mp = self.current_data['plant_totals']['total_mp_steam']
        
        print(f"📊 Current State:")
        print(f"   Total Power: {current_power:.1f} MW")
        print(f"   Total MP: {current_mp:.1f} T/h")
        
        # Reduce MP demand by specified percentage
        reduction_factor = (100 - reduction_percent) / 100
        
        optimized = {}
        total_optimized_power = 0
        total_optimized_mp = 0
        
        for gta_num in [1, 2, 3]:
            gta_key = f'gta{gta_num}'
            
            # Keep same HP input, reduce MP soutirage
            current_hp = baseline[gta_key]['hp_admission']
            reduced_mp = baseline[gta_key]['mp_soutirage'] * reduction_factor
            
            # Predict new performance
            new_power, actual_mp = self.predict_gta_performance(current_hp, reduced_mp, gta_num)
            
            optimized[gta_key] = {
                'hp_admission': current_hp,
                'mp_soutirage_target': reduced_mp,
                'mp_soutirage_actual': actual_mp,
                'power_production': new_power,
                'efficiency': new_power / current_hp if current_hp > 0 else 0,
                'status': 'optimized'
            }
            
            total_optimized_power += new_power
            total_optimized_mp += actual_mp
        
        # Calculate improvements
        power_gain = total_optimized_power - current_power
        mp_saved = current_mp - total_optimized_mp
        
        optimization_result = {
            'scenario': 'reduce_sulfuric_cadence',
            'reduction_percent': reduction_percent,
            'timestamp': datetime.now().isoformat(),
            'baseline': baseline,
            'optimized': optimized,
            'improvements': {
                'power_gain_mw': round(power_gain, 2),
                'mp_steam_saved_th': round(mp_saved, 2),
                'efficiency_improvement': round(power_gain / current_power * 100, 2) if current_power > 0 else 0
            },
            'totals': {
                'baseline_power': current_power,
                'optimized_power': total_optimized_power,
                'baseline_mp': current_mp,
                'optimized_mp': total_optimized_mp
            }
        }
        
        # Results summary
        print(f"✅ OPTIMIZATION RESULTS:")
        print(f"   Power gain: +{power_gain:.2f} MW ({power_gain/current_power*100:+.1f}%)")
        print(f"   MP saved: -{mp_saved:.1f} T/h ({mp_saved/current_mp*100:.1f}%)")
        print(f"   New totals: {total_optimized_power:.1f} MW, {total_optimized_mp:.1f} T/h")
        
        return optimization_result
    
    def optimize_scenario_2_gta2_failure(self):
        """
        Scenario 2: Préserver le maximum de production et MP avec GTA2 en panne
        Redistribute load optimally when GTA2 fails
        """
        print("🚨 OPTIMIZATION: GTA2 en panne - Redistribution optimale")
        print("="*55)
        
        if not self.current_data:
            return None
        
        # Current baseline
        baseline = {
            'gta1': self.current_data['gta1'],
            'gta2': self.current_data['gta2'],
            'gta3': self.current_data['gta3']
        }
        
        # Calculate what we're losing from GTA2
        gta2_power_lost = baseline['gta2']['power_production']
        gta2_mp_lost = baseline['gta2']['mp_soutirage']
        gta2_hp_available = baseline['gta2']['hp_admission']
        
        current_total_power = self.current_data['plant_totals']['total_power']
        current_total_mp = self.current_data['plant_totals']['total_mp_steam']
        
        print(f"📊 GTA2 Failure Impact:")
        print(f"   Power lost: {gta2_power_lost:.1f} MW")
        print(f"   MP lost: {gta2_mp_lost:.1f} T/h") 
        print(f"   HP steam available for redistribution: {gta2_hp_available:.1f} T/h")
        
        # Optimize redistribution between GTA1 and GTA3
        best_config = None
        best_total_power = 0
        
        # Try different redistribution ratios
        for gta1_ratio in [0.4, 0.5, 0.6, 0.7]:
            gta3_ratio = 1 - gta1_ratio
            
            # Calculate new HP inputs
            gta1_additional_hp = gta2_hp_available * gta1_ratio
            gta3_additional_hp = gta2_hp_available * gta3_ratio
            
            new_hp1 = baseline['gta1']['hp_admission'] + gta1_additional_hp
            new_hp3 = baseline['gta3']['hp_admission'] + gta3_additional_hp
            
            # Estimate new MP targets (try to maintain some MP production)
            new_mp1 = baseline['gta1']['mp_soutirage'] + (gta2_mp_lost * gta1_ratio * 0.8)
            new_mp3 = baseline['gta3']['mp_soutirage'] + (gta2_mp_lost * gta3_ratio * 0.8)
            
            # Constrain to realistic limits
            new_hp1 = min(new_hp1, baseline['gta1']['hp_admission'] * 1.5)  # Max 50% increase
            new_hp3 = min(new_hp3, baseline['gta3']['hp_admission'] * 1.5)
            new_mp1 = min(new_mp1, new_hp1 * 0.7)  # Max 70% of HP
            new_mp3 = min(new_mp3, new_hp3 * 0.7)
            
            try:
                # Predict performance
                power1, actual_mp1 = self.predict_gta_performance(new_hp1, new_mp1, 1)
                power3, actual_mp3 = self.predict_gta_performance(new_hp3, new_mp3, 3)
                
                total_power = power1 + power3
                total_mp = actual_mp1 + actual_mp3
                
                # Check if this is the best configuration
                if total_power > best_total_power:
                    best_total_power = total_power
                    best_config = {
                        'gta1': {
                            'hp_admission': new_hp1,
                            'mp_soutirage': actual_mp1,
                            'power_production': power1,
                            'hp_increase': gta1_additional_hp,
                            'status': 'boosted'
                        },
                        'gta2': {
                            'hp_admission': 0,
                            'mp_soutirage': 0,
                            'power_production': 0,
                            'status': 'offline'
                        },
                        'gta3': {
                            'hp_admission': new_hp3,
                            'mp_soutirage': actual_mp3,
                            'power_production': power3,
                            'hp_increase': gta3_additional_hp,
                            'status': 'boosted'
                        },
                        'redistribution_ratio': {
                            'gta1_share': gta1_ratio,
                            'gta3_share': gta3_ratio
                        },
                        'totals': {
                            'power': total_power,
                            'mp_steam': total_mp
                        }
                    }
                    
            except Exception as e:
                continue
        
        if not best_config:
            print("❌ No viable redistribution found")
            return None
        
        # Calculate performance metrics
        power_recovery_rate = (best_total_power / current_total_power) * 100
        power_loss = current_total_power - best_total_power
        mp_recovery_rate = (best_config['totals']['mp_steam'] / current_total_mp) * 100
        mp_loss = current_total_mp - best_config['totals']['mp_steam']
        
        optimization_result = {
            'scenario': 'gta2_failure_optimization',
            'timestamp': datetime.now().isoformat(),
            'baseline': baseline,
            'optimized': best_config,
            'performance': {
                'power_loss_mw': round(power_loss, 2),
                'power_recovery_rate': round(power_recovery_rate, 1),
                'mp_loss_th': round(mp_loss, 2),
                'mp_recovery_rate': round(mp_recovery_rate, 1)
            },
            'recommendations': {
                'gta1_hp_increase': round(best_config['gta1']['hp_increase'], 1),
                'gta3_hp_increase': round(best_config['gta3']['hp_increase'], 1),
                'redistribution_strategy': f"{best_config['redistribution_ratio']['gta1_share']*100:.0f}% GTA1, {best_config['redistribution_ratio']['gta3_share']*100:.0f}% GTA3"
            }
        }
        
        # Results summary
        print(f"✅ OPTIMAL REDISTRIBUTION FOUND:")
        print(f"   Power recovery: {power_recovery_rate:.1f}% ({best_total_power:.1f} MW)")
        print(f"   MP recovery: {mp_recovery_rate:.1f}% ({best_config['totals']['mp_steam']:.1f} T/h)")
        print(f"   GTA1 boost: +{best_config['gta1']['hp_increase']:.1f} T/h HP")
        print(f"   GTA3 boost: +{best_config['gta3']['hp_increase']:.1f} T/h HP")
        
        if power_recovery_rate > 85:
            print("   Status: ✅ Excellent compensation")
        elif power_recovery_rate > 75:
            print("   Status: ⚠️ Acceptable compensation")
        else:
            print("   Status: 🚨 Critical - external measures needed")
        
        return optimization_result
    
    def save_optimization_result(self, result):
        """Save optimization result to file"""
        if not result:
            return
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"optimization_{result['scenario']}_{timestamp}.json"
        filepath = os.path.join('optimization_results', filename)
        
        # Create directory if it doesn't exist
        os.makedirs('optimization_results', exist_ok=True)
        
        try:
            with open(filepath, 'w') as f:
                json.dump(result, f, indent=2)
            
            print(f"💾 Optimization result saved: {filename}")
            
        except Exception as e:
            print(f"⚠️ Could not save result: {e}")
    
    def run_optimization(self, choice):
        """Run optimization based on user choice"""
        print(f"🚀 GTA Optimization Engine")
        print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*50)
        
        # Get latest data first
        if not self.get_latest_data():
            print("❌ Cannot proceed without current data")
            return None
        
        result = None
        
        if choice == 1:
            result = self.optimize_scenario_1_reduce_sulfuric(reduction_percent=20)
        elif choice == 2:
            result = self.optimize_scenario_2_gta2_failure()
        else:
            print("❌ Invalid choice. Use 1 or 2.")
            return None
        
        # Save result
        if result:
            self.save_optimization_result(result)
        
        return result

def main():
    """Interactive optimization interface"""
    print("🏭 GTA Real-time Optimization Engine")
    print("🤖 Using trained ML models for optimal operations")
    print("="*50)
    
    try:
        # Initialize optimizer
        optimizer = GTAOptimizer()
        
        while True:
            print("\n🎯 OPTIMIZATION OPTIONS:")
            print("1 - Réduire la cadence sulfurique de 20%")
            print("2 - Préserver max production/MP avec GTA2 en panne") 
            print("3 - Exit")
            
            try:
                choice = int(input("\n👉 Enter your choice (1-3): "))
                
                if choice == 3:
                    print("👋 Goodbye!")
                    break
                elif choice in [1, 2]:
                    result = optimizer.run_optimization(choice)
                    if result:
                        print(f"\n✅ Optimization completed successfully!")
                        print(f"📊 Check optimization_results/ for detailed report")
                    else:
                        print(f"\n❌ Optimization failed")
                else:
                    print("❌ Invalid choice. Please enter 1, 2, or 3.")
                    
            except ValueError:
                print("❌ Please enter a valid number.")
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
    
    except Exception as e:
        print(f"❌ Critical error: {e}")

if __name__ == "__main__":
    main()