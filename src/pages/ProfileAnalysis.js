import React, { useEffect, useState, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './ProfileAnalysis.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Chart.js imports
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const ProfileAnalysis = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef(null); // For managing canvas destruction
  const reportRef = useRef(null); // For export

  // --- Calendar Heatmap & Streak Gauge Logic ---
  // Only compute visuals if profileData is loaded and valid
  let checkinDates = [], heatmapData = {}, streaks = { longest: 0, current: 0 }, longestPositiveStreak = 0;
  if (profileData && profileData.mood_over_time) {
    // Helper: Get all check-in dates
    checkinDates = profileData.mood_over_time.map(entry => entry.date);

    // Helper: Build calendar heatmap data (YYYY-MM-DD)
    function getHeatmapData(dates) {
      const map = {};
      dates.forEach(dateStr => {
        map[dateStr] = (map[dateStr] || 0) + 1;
      });
      return map;
    }
    heatmapData = getHeatmapData(checkinDates);

    // Helper: Get streaks (longest and current)
    function getStreaks(entries) {
      // Sort by date ascending
      const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      let longest = 0, current = 0, prevDate = null;
      let tempStreak = 0;
      sorted.forEach(entry => {
        const date = new Date(entry.date);
        if (prevDate) {
          const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longest) longest = tempStreak;
        prevDate = date;
      });
      // Current streak: count from last date backwards
      current = 1;
      for (let i = sorted.length - 1; i > 0; i--) {
        const date = new Date(sorted[i].date);
        const prev = new Date(sorted[i - 1].date);
        if ((date - prev) / (1000 * 60 * 60 * 24) === 1) {
          current++;
        } else {
          break;
        }
      }
      return { longest, current };
    }
    streaks = getStreaks(profileData.mood_over_time);

    // Helper: Get longest positive mood streak
    function getPositiveStreak(entries) {
      let longest = 0, current = 0;
      entries.forEach(entry => {
        if (entry.mood >= 4) { // Assuming mood 4+ is positive
          current++;
          if (current > longest) longest = current;
        } else {
          current = 0;
        }
      });
      return longest;
    }
    longestPositiveStreak = getPositiveStreak(profileData.mood_over_time);
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch profile data from backend on component mount
  useEffect(() => {
    if (user) {
      // Pass user ID to get user-specific analysis
      axios.get(`http://localhost:8000/analysis?user_id=${user.uid}`)
        .then(res => {
          console.log("Profile data:", res.data); // Check the structure here
          setProfileData(res.data);
        })
        .catch(err => {
          console.error("Error fetching data:", err);
          setAnalysisError("Unable to load your profile analysis. Please try again later or check your connection.");
        });
    }
  }, [user]);

  // Handle loading and error state
  if (loading) return <div className="loading-container">Loading...</div>;
  if (!user) return null;
  if (analysisError) return <div className="error-message">{analysisError}</div>;
  if (!profileData) return <div className="loading-analysis">Loading your analysis...</div>;
  if (profileData && profileData.message === "No check-ins available") {
    return (
      <div className="no-data-message">
        <h3>No check-ins available</h3>
        <p>Please complete a wellness check-in to see your profile analysis.</p>
        <button onClick={() => navigate('/checkin')} className="checkin-btn">
          Go to Check-in
        </button>
      </div>
    );
  }

  // Helper: Get ISO week string from date
  function getWeek(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    // ISO week calculation
    const jan1 = new Date(year, 0, 1);
    const days = Math.floor((date - jan1) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${year}-W${week}`;
  }

  // Aggregate mood scores by week
  const weeklyMoodMap = {};
  profileData.mood_over_time.forEach(entry => {
    const week = getWeek(entry.date);
    if (!weeklyMoodMap[week]) weeklyMoodMap[week] = [];
    weeklyMoodMap[week].push(entry.mood);
  });
  const weeklyLabels = Object.keys(weeklyMoodMap);
  const weeklyAverages = weeklyLabels.map(week => {
    const moods = weeklyMoodMap[week];
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  });

  // Data for the Line chart (Weekly Avg Mood Over Time)
  const lineChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Weekly Avg Mood',
        data: weeklyAverages,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      }
    ]
  };

  // Data for the Pie chart (Mood Distribution)
  const pieChartData = {
    labels: Object.keys(profileData.mood_distribution),
    datasets: [
      {
        data: Object.values(profileData.mood_distribution),
        backgroundColor: [
          '#4caf50',
          '#f44336',
          '#ffeb3b',
          '#2196f3',
          '#ff9800',
        ],
        hoverBackgroundColor: [
          '#4caf10',
          '#f42116',
          '#ffeb3b',
          '#2196f3',
          '#ff9800',
        ],
        borderColor: 'rgba(0, 0, 0, 0.1)', // Optional: to create a subtle border effect
        borderWidth: 1, // Optional: for subtle borders
      },
    ],
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true, // Tooltip enabled on hover
        },
      },
      interaction: {
        mode: 'nearest', // Hovering nearest element
        intersect: false, // Keep hovering even if not over the center
      },
      elements: {
        arc: {
          borderWidth: 2, // Optional: border thickness for the chart segments
          hoverBorderWidth: 4, // Increase border width on hover for visual effect
          hoverBorderColor: '#000', // Optional: change border color on hover
        },
      },
    },
  };

  // Enhanced heatmap function with proper calendar layout and labels
  const generateHeatmapCalendar = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // Show full year
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(startDate);
    
    // Start from the first day of the week containing startDate
    const startDay = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - startDay);
    
    // Generate calendar grid
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().slice(0, 10);
      const count = heatmapData[dateKey] || 0;
      const intensity = count > 0 ? Math.min(count / 3, 1) : 0;
      
      currentWeek.push({
        date: new Date(currentDate),
        dateKey,
        count,
        intensity
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Month labels for heatmap
  const getMonthLabels = (weeks) => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < weeks.length; i += 4) {
      if (weeks[i] && weeks[i][0]) {
        const month = weeks[i][0].date.getMonth();
        months.push({
          index: i,
          name: monthNames[month]
        });
      }
    }
    
    return months;
  };

  // Fixing Canvas Reuse by Clearing the Chart Before Rendering
  const renderChart = (canvasId) => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.chartInstance;
      if (chartInstance) {
        chartInstance.destroy();  // Destroy the previous chart instance to avoid reusing the same canvas
      }
    }
  };

  const exportAsPNG = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Temporarily hide export controls so they don't appear in the image
      const exportBar = reportRef.current.querySelector('.export-bar');
      let prevDisplay;
      if (exportBar) { 
        prevDisplay = exportBar.style.display; 
        exportBar.style.display = 'none'; 
      }

      // Wait for any animations or transitions to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Enhanced html2canvas options for better capture
      const canvas = await html2canvas(reportRef.current, { 
        scale: 1.5,
        useCORS: true, 
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied to the cloned document
          const clonedElement = clonedDoc.querySelector('.profile-analysis');
          if (clonedElement) {
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.height = 'auto';
          }
        }
      });

      if (exportBar) { 
        exportBar.style.display = prevDisplay || ''; 
      }

      const link = document.createElement('a');
      link.download = `mindwell_report_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error exporting PNG. Please try again.');
    }
    setIsExporting(false);
  };

  const exportAsPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Hide export buttons during capture so they aren't included in PDF
      const exportBar = reportRef.current.querySelector('.export-bar');
      let prevDisplay;
      if (exportBar) { 
        prevDisplay = exportBar.style.display; 
        exportBar.style.display = 'none'; 
      }

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Enhanced html2canvas options for PDF
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true, 
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are applied to the cloned document
          const clonedElement = clonedDoc.querySelector('.profile-analysis');
          if (clonedElement) {
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.height = 'auto';
            clonedElement.style.transform = 'none';
          }
        }
      });

      if (exportBar) { 
        exportBar.style.display = prevDisplay || ''; 
      }

      const pdf = new jsPDF('p', 'mm', 'a4');

      // More conservative margins for better content fit
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      // Calculate scaling to fit width
      const scaleRatio = usableWidth / canvas.width;
      const scaledHeight = canvas.height * scaleRatio;

      // If content fits on one page
      if (scaledHeight <= usableHeight) {
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, scaledHeight);
      } else {
        // Multi-page handling with overlap to prevent content cutoff
        const overlap = 20; // 20px overlap between pages
        const effectivePageHeight = usableHeight / scaleRatio - overlap;
        let yOffset = 0;
        let pageIndex = 0;

        while (yOffset < canvas.height) {
          const sliceHeight = Math.min(effectivePageHeight, canvas.height - yOffset);
          
          // Create slice canvas
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight + (yOffset > 0 ? overlap : 0);
          
          const sliceCtx = sliceCanvas.getContext('2d');
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          
          // Draw the slice with overlap
          sliceCtx.drawImage(
            canvas,
            0,
            Math.max(0, yOffset - (yOffset > 0 ? overlap : 0)),
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          const imgData = sliceCanvas.toDataURL('image/png', 1.0);
          
          if (pageIndex > 0) pdf.addPage();
          
          const sliceScaledHeight = sliceCanvas.height * scaleRatio;
          pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, sliceScaledHeight);
          
          yOffset += effectivePageHeight;
          pageIndex += 1;
        }
      }

      pdf.save(`mindwell_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
    setIsExporting(false);
  };

  const printReport = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    try {
      // Hide export bar for printing
      const exportBar = reportRef.current.querySelector('.export-bar');
      let prevDisplay;
      if (exportBar) { 
        prevDisplay = exportBar.style.display; 
        exportBar.style.display = 'none'; 
      }

      // Get all stylesheets from the current document
      const styleSheets = Array.from(document.styleSheets);
      let allCSS = '';
      
      // Extract CSS rules from stylesheets
      styleSheets.forEach(styleSheet => {
        try {
          if (styleSheet.cssRules || styleSheet.rules) {
            const rules = styleSheet.cssRules || styleSheet.rules;
            Array.from(rules).forEach(rule => {
              allCSS += rule.cssText + '\n';
            });
          }
        } catch (e) {
          // Some stylesheets might not be accessible due to CORS
          console.warn('Could not access stylesheet:', e);
        }
      });

      // Add custom print styles
      const printStyles = `
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
          margin: 0 !important;
          padding: 15px !important;
          background: white !important;
          color: #333 !important;
          line-height: 1.4 !important;
        }
        .export-bar { display: none !important; }
        .profile-analysis { 
          background: white !important;
          min-height: auto !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          backdrop-filter: none !important;
          padding: 0 !important;
        }
        .profile-analysis h2 {
          color: #2c3e50 !important;
          text-align: center !important;
          font-size: 24px !important;
          margin: 0 0 20px !important;
          page-break-after: avoid !important;
        }
        .user-welcome {
          background: #f8f9fa !important;
          border: 1px solid #ddd !important;
          border-radius: 8px !important;
          padding: 12px !important;
          margin: 0 0 16px !important;
          text-align: center !important;
        }
        .summary-card, .insights, .word-cloud, .ai-summary, .recommendations {
          background: white !important;
          box-shadow: none !important;
          border: 2px solid #e9ecef !important;
          border-radius: 8px !important;
          margin: 12px 0 !important;
          padding: 16px !important;
          page-break-inside: avoid !important;
        }
        .chart {
          background: white !important;
          box-shadow: none !important;
          border: 2px solid #e9ecef !important;
          border-radius: 8px !important;
          margin: 12px 0 !important;
          padding: 16px !important;
          page-break-inside: avoid !important;
          min-height: 200px !important;
        }
        .charts {
          display: block !important;
        }
        .chart h4, .summary-card h3, .insights h4, .word-cloud h4, .ai-summary h4, .recommendations h4 {
          color: #2c3e50 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          margin: 0 0 12px !important;
          page-break-after: avoid !important;
        }
        .summary-card p {
          margin: 8px 0 !important;
          padding: 6px 8px !important;
          background: #f8f9fa !important;
          border-left: 3px solid #3498db !important;
          border-radius: 4px !important;
        }
        .streak-gauge {
          background: #f8f9fa !important;
          border: 1px solid #ddd !important;
          border-radius: 8px !important;
          padding: 12px !important;
          margin: 12px 0 !important;
        }
        .streak-items {
          display: block !important;
        }
        .streak-gauge span {
          display: block !important;
          background: #e3f2fd !important;
          border: 1px solid #3498db !important;
          padding: 6px 10px !important;
          margin: 4px 0 !important;
          border-radius: 4px !important;
          color: #2980b9 !important;
        }
        .heatmap-container {
          background: #f8f9fa !important;
          border: 1px solid #ddd !important;
          border-radius: 8px !important;
          padding: 12px !important;
        }
        .heatmap-day {
          display: inline-block !important;
          width: 8px !important;
          height: 8px !important;
          margin: 0.5px !important;
          border: 1px solid #ddd !important;
        }
        .ai-summary-list, .recommendations ul {
          list-style: none !important;
          padding: 0 !important;
        }
        .ai-summary-list li, .recommendations li {
          background: #f8f9fa !important;
          border-left: 3px solid #3498db !important;
          padding: 8px 12px !important;
          margin: 6px 0 !important;
          border-radius: 4px !important;
        }
        .insights p, .word-cloud p {
          background: #f8f9fa !important;
          border-left: 3px solid #27ae60 !important;
          padding: 8px 12px !important;
          margin: 6px 0 !important;
          border-radius: 4px !important;
        }
        * {
          box-shadow: none !important;
          backdrop-filter: none !important;
        }
        @media print {
          body { margin: 0 !important; }
          .chart { 
            min-height: 150px !important; 
            display: block !important;
          }
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }
        }
        @page {
          margin: 0.5in;
          size: A4;
        }
      `;

      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Convert charts to images for printing
      const chartElements = reportRef.current.querySelectorAll('.chart canvas');
      const chartImages = [];
      
      for (let canvas of chartElements) {
        if (canvas && canvas.toDataURL) {
          try {
            const imgData = canvas.toDataURL('image/png');
            chartImages.push({
              element: canvas.parentElement,
              dataURL: imgData
            });
          } catch (e) {
            console.warn('Could not convert chart to image:', e);
          }
        }
      }

      // Clone the content for printing
      const printContent = reportRef.current.cloneNode(true);
      
      // Replace canvas elements with images
      const printCharts = printContent.querySelectorAll('.chart');
      printCharts.forEach((chartDiv, index) => {
        const canvas = chartDiv.querySelector('canvas');
        if (canvas && chartImages[index]) {
          const img = document.createElement('img');
          img.src = chartImages[index].dataURL;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          img.style.margin = '0 auto';
          canvas.parentNode.replaceChild(img, canvas);
        }
      });

      // Create print window
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mental Wellness Report - ${user.displayName || user.email}</title>
            <meta charset="UTF-8">
            <style>
              ${allCSS}
              ${printStyles}
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content and images to load
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close window after printing
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };

      // Restore export bar
      if (exportBar) { 
        exportBar.style.display = prevDisplay || ''; 
      }

    } catch (error) {
      console.error('Error printing report:', error);
      alert('Error preparing report for printing. Please try again.');
    }
    setIsExporting(false);
  };

  // Generate heatmap data
  const heatmapWeeks = generateHeatmapCalendar();
  const monthLabels = getMonthLabels(heatmapWeeks);

  return (
    <div className="profile-analysis" ref={reportRef}>
      <h2>Your Mental Wellness Summary</h2>
      <div className="export-bar">
        <button 
          className="export-btn" 
          onClick={exportAsPDF}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Download PDF'}
        </button>
        <button 
          className="export-btn" 
          onClick={exportAsPNG}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Download PNG'}
        </button>
        <button 
          className="export-btn" 
          onClick={printReport}
          disabled={isExporting}
        >
          Print
        </button>
      </div>
      <div className="user-welcome">
        <p>Welcome, {user.displayName || user.email}!</p>
      </div>
      <div className="summary-card">
        <h3>{profileData.name}</h3>
        <p><span>Total Check-Ins:</span> <span>{profileData.total_checkins}</span></p>
        <p><span>Overall Mood:</span> <span>{profileData.overall_mood}</span></p>
        <p><span>Last Check-In:</span> <span>{profileData.last_checkin}</span></p>
        <p><span>Wellness Score:</span> <span>{profileData.wellness_score.toFixed(1)} / 5</span></p>
        <div className="streak-gauge">
          <strong>🔥 Streaks:</strong>
          <div className="streak-items">
            <span>Longest streak: {streaks.longest} days</span>
            <span>Current streak: {streaks.current} days</span>
            <span>Longest positive mood streak: {longestPositiveStreak} days</span>
          </div>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h4>Mood Over Time</h4>
          <Line data={lineChartData} />
        </div>
        <div className="chart">
          <h4>Mood Distribution</h4>
          <Pie data={pieChartData} />
        </div>
        <div className="chart heatmap">
          <h4>Check-in Calendar Heatmap</h4>
          <div className="heatmap-container">
            <div className="heatmap-months">
              {monthLabels.map((month, idx) => (
                <div 
                  key={idx}
                  className="month-label"
                  style={{
                    gridColumn: `${month.index + 1} / span 4`,
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: '4px'
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
            <div className="heatmap-grid">
              <div className="weekday-labels">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="heatmap-weeks">
                {heatmapWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="heatmap-week">
                    {week.map((day, dayIdx) => (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className="heatmap-day"
                        title={`${day.dateKey}: ${day.count} check-in${day.count !== 1 ? 's' : ''}`}
                        style={{
                          backgroundColor: day.count > 0 
                            ? `rgba(76, 175, 80, ${0.2 + day.intensity * 0.8})` 
                            : '#eee',
                          opacity: day.date > new Date() ? 0.3 : 1
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-colors">
                <div style={{backgroundColor: '#eee'}}></div>
                <div style={{backgroundColor: 'rgba(76, 175, 80, 0.3)'}}></div>
                <div style={{backgroundColor: 'rgba(76, 175, 80, 0.5)'}}></div>
                <div style={{backgroundColor: 'rgba(76, 175, 80, 0.7)'}}></div>
                <div style={{backgroundColor: 'rgba(76, 175, 80, 1)'}}></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      <div className="insights">
        <h4>🗣️ Voice Sentiment Insights</h4>
        <p><strong>Most Common Tone:</strong> {profileData.voice_insights.most_common}</p>
        <p><strong>Recent Spike:</strong> {profileData.voice_insights.spike_date} - {profileData.voice_insights.spike_reason}</p>
        <p><strong>Trend:</strong> {profileData.voice_insights.trend}</p>
      </div>

      <div className="word-cloud">
        <h4>📚 Reflective Word Cloud</h4>
        <p>{profileData.word_cloud.join(', ')}</p>
      </div>

      <div className="ai-summary">
        <h4>🧠 AI Summary</h4>
        <ul className="ai-summary-list">
          {profileData.ai_summary
            .split(/\n\*/g) // Split on newlines followed by *
            .map(point => point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) // Bold
            .map(point => point.trim())
            .filter(Boolean)
            .map((point, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: point }} />
            ))}
        </ul>
      </div>

      <div className="recommendations">
        <h4>🎯 Recommendations</h4>
        <ul>
          {profileData.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileAnalysis;