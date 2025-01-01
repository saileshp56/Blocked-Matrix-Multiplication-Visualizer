import React, { useState } from 'react';

const ArrowIndicator = ({ label, position, orientation, color = '#2563eb' }) => {
  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      color: color,
      fontFamily: 'monospace',
      fontSize: '14px'
    };

    if (orientation === 'top') {
      return {
        ...baseStyle,
        top: '-25px',
        left: `${position * 52}px`,
        flexDirection: 'column'
      };
    } else if (orientation === 'left') {
      return {
        ...baseStyle,
        top: `${position * 52 + 30}px`,
        left: '-40px',
        flexDirection: 'row'
      };
    }
  };

  const getArrowContent = () => {
    if (orientation === 'top') {
      return (
        <>
          <div>{label}</div>
          <div>↓</div>
        </>
      );
    } else if (orientation === 'left') {
      return (
        <>
          <div>{label}</div>
          <div style={{ marginLeft: '4px' }}>→</div>
        </>
      );
    }
  };

  return (
    <div style={getArrowStyle()}>
      {getArrowContent()}
    </div>
  );
};

const BlockedMatrixMultiplication = () => {
  const N = 4;
  const blockSize = 2;
  const totalSteps = (N/blockSize) * (N/blockSize) * (N/blockSize) * blockSize * blockSize * blockSize;
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([{ result: Array(N).fill().map(() => Array(N).fill(0)), step: 0 }]);

  // Matrix init.
  const A = Array(N).fill().map((_, i) => Array(N).fill().map((_, j) => i * N + j + 1));
  const B = Array(N).fill().map((_, i) => Array(N).fill().map((_, j) => (i * N + j + 1) * 2));
  const [result, setResult] = useState(Array(N).fill().map(() => Array(N).fill(0)));

  const getCurrentIndices = () => {
    const stepsPerJ2 = 1;
    const stepsPerK2 = blockSize;
    const stepsPerI2 = blockSize * blockSize;
    const stepsPerKBlock = blockSize * blockSize * blockSize;
    const stepsPerJBlock = (N/blockSize) * stepsPerKBlock;
    const stepsPerIBlock = (N/blockSize) * stepsPerJBlock;

    const iBlock = Math.floor(step / stepsPerIBlock) * blockSize;
    const jBlock = (Math.floor(step / stepsPerJBlock) % (N/blockSize)) * blockSize;
    const kBlock = (Math.floor(step / stepsPerKBlock) % (N/blockSize)) * blockSize;
    
    const i2 = iBlock + Math.floor((step % stepsPerKBlock) / stepsPerI2);
    const k2 = kBlock + Math.floor((step % stepsPerI2) / stepsPerK2);
    const j2 = jBlock + (step % stepsPerK2);

    return { iBlock, jBlock, kBlock, i2, j2, k2 };
  };

  const reset = () => {
    setStep(0);
    setResult(Array(N).fill().map(() => Array(N).fill(0)));
    setHistory([{ result: Array(N).fill().map(() => Array(N).fill(0)), step: 0 }]);
  };

  const nextStep = () => {
    if (step >= totalSteps) return;
    
    const { i2, j2, k2 } = getCurrentIndices();
    const newResult = [...result.map(row => [...row])];
    newResult[i2][j2] += A[i2][k2] * B[k2][j2];
    setResult(newResult);
    setStep(step + 1);
    setHistory([...history, { result: newResult, step: step + 1 }]);
  };

  const previousStep = () => {
    if (step <= 0) return;
  
    const prevHistory = history[history.length - 2];
    setResult(prevHistory.result);
    setStep(prevHistory.step);
    setHistory(history.slice(0, -1));
  };

  const { i2, j2, k2, iBlock, jBlock, kBlock } = getCurrentIndices();

  const getCellStyle = (i, j, matrix) => {
    let isActive = false;
    let isInBlock = false;
    
    let activeColor = '#bfdbfe';
    if (step < totalSteps) {
      if (matrix === 'A') {
        isActive = i === i2 && j === k2;
        isInBlock = i >= iBlock && i < iBlock + blockSize && j >= kBlock && j < kBlock + blockSize;
      } else if (matrix === 'B') {
        isActive = i === k2 && j === j2;
        isInBlock = i >= kBlock && i < kBlock + blockSize && j >= jBlock && j < jBlock + blockSize;
      } else if (matrix === 'result') {
        isActive = i === i2 && j === j2;
        isInBlock = i >= iBlock && i < iBlock + blockSize && j >= jBlock && j < jBlock + blockSize;
        activeColor = '#FA6868'
      }
    }
    
    return {
      width: '48px',
      height: '48px',
      border: '1px solid #ccc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isActive ? activeColor : isInBlock ? '#e5e7eb' : 'white',
      transition: 'background-color 0.2s'
    };
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '0 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff'
  };

  const MatrixWithArrows = ({ matrix, matrixName, arrows }) => (
    <div style={{ position: 'relative' }}>
      <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '8px' }}>{matrixName}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {matrix.map((row, i) => 
          row.map((val, j) => (
            <div key={`${matrixName}-${i}-${j}`} style={getCellStyle(i, j, matrixName)}>
              {val}
            </div>
          ))
        )}
      </div>
      {arrows}
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Blocked Matrix Multiplication Visualization
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
      <MatrixWithArrows 
          matrix={A} 
          matrixName="A"
          arrows={<>
            <ArrowIndicator label="iBlock" position={iBlock} orientation="left" />
            <ArrowIndicator label="kBlock" position={kBlock} orientation="top" />
          </>}
        />
        
        <MatrixWithArrows 
          matrix={B} 
          matrixName="B"
          arrows={<>
            <ArrowIndicator label="kBlock" position={kBlock} orientation="left" />
            <ArrowIndicator label="jBlock" position={jBlock} orientation="top" />
          </>}
        />
        
        <MatrixWithArrows 
          matrix={result} 
          matrixName="result"
          arrows={<>
            <ArrowIndicator label="iBlock" position={iBlock} orientation="left"/>
            <ArrowIndicator label="jBlock" position={jBlock} orientation="top"  />
          </>}
        />
      </div>

      <div style={{ 
        textAlign: 'center', 
        fontFamily: 'monospace', 
        backgroundColor: '#f3f4f6', 
        padding: '16px', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        {step < totalSteps ? 
          `res[${i2}][${j2}] += A[${i2}][${k2}] * B[${k2}][${j2}]` : 
          "Multiplication complete"}
          <br />
          {`\n\nres[i2][j2] += A[i2][k2] * B[k2][j2]`}
          <br />
          {`i2: ${i2}`}
          <br />
          {`k2: ${k2}`}
          <br />
          {`j2: ${j2}`}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={previousStep}
          style={buttonStyle}
        >
          Previous Step
        </button>
        <button 
          onClick={nextStep} 
          disabled={step >= totalSteps}
          style={buttonStyle}
        >
          Next Step
        </button>
        <button 
          onClick={reset}
          style={buttonStyle}
        >
          Reset
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        Step {step} of {totalSteps}
      </div>

      <pre style={{ 
            textAlign: 'left', 
            fontFamily: 'monospace', 
            backgroundColor: '#f3f4f6', 
            padding: '16px', 
            borderRadius: '4px',
            overflowX: 'auto',
            marginBottom: '20px'
          }}>
            <code>
    {`for (iBlock = 0; iBlock < N; iBlock += blockSize)
      for (jBlock = 0; jBlock < N; jBlock += blockSize)
        for (kBlock = 0; kBlock < N; kBlock += blockSize)
            
            // Multiply the sub-block (i2, j2, k2)
            for (i2 = iBlock; i2 < iBlock + blockSize; i2++)
                for (k2 = kBlock; k2 < kBlock + blockSize; k2++)
                    for (j2 = jBlock; j2 < jBlock + blockSize; j2++)
                        res[i2][j2] += A[i2][k2] * B[k2][j2];`}
            </code>
          </pre>
          This is a visualization of blocked matrix multiplication with a blocksize of 2 for 4x4 matrix multiplication.
          <br />
          Assumptions: 
          <ul>
            <li>Matrices are row major</li>
            <li>Cache Line Size = 16, sizeof(Matrix Element) = 8, &there4; blockSize = 2</li>
            <li>The program only uses L1 cache</li>
            <li>There are 4 cache lines in L1</li>
          </ul>

    </div>
  );
};

export default BlockedMatrixMultiplication;
